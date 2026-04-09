"use server"

import { db } from "@/db";
import { profiles, sections, userGroups, permissions, categories, subcategories, items } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 1.OBTENER EMPLEADOS 
 */
export async function getAgents() {
    try {
        const agents = await db.select().from(profiles).orderBy(profiles.createdAt);
        return agents;
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        return [];
    }
}

/**
 * 1.2 OBTENER EMPLEADO POR ID (con grupos y permisos)
 */
export async function getAgentById(id: string) {
    try {
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.id, id)
        });

        if (!profile) return null;

        const groups = await db.select({ id: userGroups.groupId })
            .from(userGroups)
            .where(eq(userGroups.userId, id));

        const userPermissions = await db.select().from(permissions).where(eq(permissions.userId, id));

        return {
            ...profile,
            groupIds: groups.map(g => g.id),
            permissions: userPermissions
        };
    } catch (error) {
        console.error("Error al obtener empleado por ID:", error);
        return null;
    }
}

/**
 * 1.5 OBTENER DATOS DEL DASHBOARD PARA EL USUARIO ACTUAL
 */
export async function getDashboardData() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() {}
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
    })

    if (!profile) return { profile: null, sections: [] }

    // Si es superadmin, ve todo
    if (profile.role === 'superadmin') {
        const allSections = await db.select().from(sections).orderBy(sections.name)
        return { profile, sections: allSections }
    }

    // Obtenemos todos los permisos del usuario (Directos + Grupos)
    const allPerms = await db.select({ 
        targetId: permissions.targetId,
        targetType: permissions.targetType
    })
    .from(permissions)
    .where(
        sql`${permissions.userId} = ${user.id} OR ${permissions.groupId} IN (
            SELECT group_id FROM user_groups WHERE user_id = ${user.id}
        )`
    );

    const sectionIds = new Set<string>();

    // Añadimos las antiguas asignaciones directas por compatibilidad
    if (profile.assignedSectionIds) {
        profile.assignedSectionIds.forEach(id => sectionIds.add(id));
    }

    // Resolvimos cada permiso hasta su ID de sección correspondiente
    for (const perm of allPerms) {
        if (perm.targetType === 'section') {
            sectionIds.add(perm.targetId);
        } else if (perm.targetType === 'category') {
            const cat = await db.select({ sectionId: categories.sectionId })
                .from(categories)
                .where(eq(categories.id, perm.targetId))
                .limit(1);
            if (cat[0]) sectionIds.add(cat[0].sectionId);
        } else if (perm.targetType === 'subcategory') {
            const sub = await db.select({ sectionId: categories.sectionId })
                .from(subcategories)
                .innerJoin(categories, eq(subcategories.categoryId, categories.id))
                .where(eq(subcategories.id, perm.targetId))
                .limit(1);
            if (sub[0]) sectionIds.add(sub[0].sectionId);
        } else if (perm.targetType === 'item') {
            const item = await db.select({ sectionId: categories.sectionId })
                .from(items)
                .innerJoin(subcategories, eq(items.subcategoryId, subcategories.id))
                .innerJoin(categories, eq(subcategories.categoryId, categories.id))
                .where(eq(items.id, perm.targetId))
                .limit(1);
            if (item[0]) sectionIds.add(item[0].sectionId);
        }
    }

    let assignedSections: any[] = []
    if (sectionIds.size > 0) {
        assignedSections = await db.select().from(sections)
            .where(inArray(sections.id, Array.from(sectionIds)))
            .orderBy(sections.name)
    }

    return { profile, sections: assignedSections }
}

/**
 * 2. CREAR EMPLEADOS
 */
export async function createAgent(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: "admin" | "usuario" | "superadmin";
    groupIds?: string[];
    permissionItems?: { targetType: "section" | "category" | "subcategory" | "item", targetId: string }[];
    password?: string;
}) {
    const supabaseAdmin = getAdminClient();
    try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password || "Telmark2026!", // Contraseña por defecto 
            email_confirm: true,
            user_metadata: {
                firstName: data.firstName,
                lastName: data.lastName,
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario en Auth");

        const [profile] = await db.insert(profiles).values({
            id: authData.user.id, // Enlazamos con el ID de Supabase
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role,
        }).returning();

        // Asignar grupos
        if (data.groupIds && data.groupIds.length > 0) {
            await db.insert(userGroups).values(
                data.groupIds.map(groupId => ({ userId: profile.id, groupId }))
            );
        }

        // Asignar permisos individuales
        if (data.permissionItems && data.permissionItems.length > 0) {
            await db.insert(permissions).values(
                data.permissionItems.map(p => ({
                    userId: profile.id,
                    targetType: p.targetType,
                    targetId: p.targetId,
                }))
            );
        }

        revalidatePath("/admin/agents");
        revalidatePath("/dashboard");
        return { success: true, data: profile };
    } catch (error: any) {
        console.error("Error al crear empleado:", error);
        return { success: false, error: error.message }
    }
}

/**
 * 3. ACTUALIZAR EMPLEADO
 */
export async function updateAgent(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    role: "admin" | "usuario" | "superadmin";
    groupIds: string[];
    permissionItems: { targetType: "section" | "category" | "subcategory" | "item", targetId: string }[];
}>) {
    try {
        const { groupIds, permissionItems, ...profileData } = data;

        // Actualizar perfil
        await db.update(profiles)
            .set({
                ...profileData,
                updatedAt: new Date(),
            }).where(eq(profiles.id, id));

        // Actualizar grupos
        if (groupIds !== undefined) {
            await db.delete(userGroups).where(eq(userGroups.userId, id));
            if (groupIds.length > 0) {
                await db.insert(userGroups).values(
                    groupIds.map(groupId => ({ userId: id, groupId }))
                );
            }
        }

        // Actualizar permisos
        if (permissionItems !== undefined) {
            await db.delete(permissions).where(eq(permissions.userId, id));
            if (permissionItems.length > 0) {
                await db.insert(permissions).values(
                    permissionItems.map(p => ({
                        userId: id,
                        targetType: p.targetType,
                        targetId: p.targetId,
                    }))
                );
            }
        }

        revalidatePath("/admin/agents");
        revalidatePath("/dashboard");
        return { success: true }
    } catch (error: any) {
        console.error("error al actualizar", error);
        return { success: false, error: error.message };
    }
}

/**
 * 4. ELIMINAR EMPLEADO
 */
export async function deleteAgent(id: string) {
    const supabaseAdmin = getAdminClient();
    try {
        await supabaseAdmin.auth.admin.deleteUser(id);
        await db.delete(profiles).where(eq(profiles.id, id));

        revalidatePath("/admin/agents");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar", error);
        return { success: false, error: error.message };
    }
}