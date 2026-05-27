"use server"

import { db } from "@/db";
import { profiles, sections, userGroups, permissions, categories, subcategories, items, groups } from "@/db/schema";
import { eq, inArray, sql, or } from "drizzle-orm";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireAdmin, getCurrentUser } from "@/lib/auth-guard";

/**
 * 1.OBTENER EMPLEADOS (con grupos para visualización)
 */
export async function getAgents() {
    await requireAdmin();
    try {
        const agents = await db.select().from(profiles).orderBy(profiles.createdAt);
        
        // Obtenemos grupos para todos los agentes de una vez
        const allUserGroups = await db.select({
            userId: userGroups.userId,
            groupName: groups.name
        })
        .from(userGroups)
        .innerJoin(groups, eq(userGroups.groupId, groups.id));

        // Obtenemos conteo de permisos individuales
        const allPerms = await db.select({
            userId: permissions.userId,
            count: sql<number>`count(*)`
        })
        .from(permissions)
        .where(sql`${permissions.userId} IS NOT NULL`)
        .groupBy(permissions.userId);

        return agents.map(agent => ({
            ...agent,
            groups: allUserGroups.filter(ug => ug.userId === agent.id).map(ug => ug.groupName),
            directPermissionCount: Number(allPerms.find(p => p.userId === agent.id)?.count || 0)
        }));
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        return [];
    }
}

import { getUserPermissions } from "./permissions";

/**
 * 1.2 OBTENER EMPLEADO POR ID (con grupos y permisos)
 */
export async function getAgentById(id: string) {
    await requireAdmin();
    try {
        const profile = await db.query.profiles.findFirst({
            where: (profiles, { eq }) => eq(profiles.id, id)
        });

        if (!profile) return null;

        const groups = await db.select({ id: userGroups.groupId })
            .from(userGroups)
            .where(eq(userGroups.userId, id));

        const permissionsData = await getUserPermissions(id);

        return {
            ...profile,
            groupIds: groups.map(g => g.id),
            permissions: permissionsData.individual,
            inheritedPermissions: permissionsData.fromGroups,
            allPermissions: permissionsData.all
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
    const auth = await getCurrentUser()
    if (!auth) return { profile: null, sections: [] }
    const { user, profile } = auth

    // Si es superadmin o admin, ve todo
    if (profile.role === 'superadmin' || profile.role === 'admin') {
        const allSections = await db.select().from(sections).orderBy(sections.name)
        const { getSignedUrlAction } = await import("@/actions/storage")
        for (const s of allSections) {
            const sectionWithImage = s as any;
            if (s.imagePath && !s.imagePath.startsWith('http')) {
                try {
                    const url = await getSignedUrlAction(s.imagePath)
                    if (url) sectionWithImage.imageUrl = url
                } catch (e) {}
            } else if (s.imagePath) {
                sectionWithImage.imageUrl = s.imagePath
            }
        }
        return { profile, sections: allSections }
    }

    // Obtenemos los IDs de los grupos del usuario de forma explícita
    const userGroupsQuery = await db.select({ groupId: userGroups.groupId })
        .from(userGroups)
        .where(eq(userGroups.userId, user.id));
    
    const userGroupIds = userGroupsQuery.map(g => g.groupId);

    // Obtenemos todos los permisos del usuario (Directos + Grupos) con una consulta robusta
    const allPerms = await db.select({ 
        targetId: permissions.targetId,
        targetType: permissions.targetType
    })
    .from(permissions)
    .where(
        or(
            eq(permissions.userId, user.id),
            userGroupIds.length > 0 ? inArray(permissions.groupId, userGroupIds) : sql`FALSE`
        )
    );

    const sectionIds = new Set<string>();

    // Añadimos las antiguas asignaciones directas por compatibilidad
    if (profile.assignedSectionIds) {
        profile.assignedSectionIds.forEach(id => sectionIds.add(id));
    }

    // --- Resolución Optimizada de Secciones ---
    
    // 1. Directas desde secciones
    allPerms.filter(p => p.targetType === 'section').forEach(p => sectionIds.add(p.targetId));

    // 2. Desde categorías
    const categoryIds = allPerms.filter(p => p.targetType === 'category').map(p => p.targetId);
    if (categoryIds.length > 0) {
        const cats = await db.select({ sectionId: categories.sectionId })
            .from(categories)
            .where(inArray(categories.id, categoryIds));
        cats.forEach(c => sectionIds.add(c.sectionId));
    }

    // 3. Desde subcategorías
    const subcategoryIds = allPerms.filter(p => p.targetType === 'subcategory').map(p => p.targetId);
    if (subcategoryIds.length > 0) {
        const subs = await db.select({ sectionId: categories.sectionId })
            .from(subcategories)
            .innerJoin(categories, eq(subcategories.categoryId, categories.id))
            .where(inArray(subcategories.id, subcategoryIds));
        subs.forEach(s => sectionIds.add(s.sectionId));
    }

    // 4. Desde ítems
    const itemIds = allPerms.filter(p => p.targetType === 'item').map(p => p.targetId);
    if (itemIds.length > 0) {
        const itms = await db.select({ sectionId: categories.sectionId })
            .from(items)
            .innerJoin(subcategories, eq(items.subcategoryId, subcategories.id))
            .innerJoin(categories, eq(subcategories.categoryId, categories.id))
            .where(inArray(items.id, itemIds));
        itms.forEach(i => sectionIds.add(i.sectionId));
    }

    let assignedSections: any[] = []
    if (sectionIds.size > 0) {
        assignedSections = await db.select().from(sections)
            .where(inArray(sections.id, Array.from(sectionIds)))
            .orderBy(sections.name)
    }

    const { getSignedUrlAction } = await import("@/actions/storage")
    
    for (const s of assignedSections) {
        const sectionWithImage = s as any;
        if (s.imagePath && !s.imagePath.startsWith('http')) {
            try {
                const url = await getSignedUrlAction(s.imagePath)
                if (url) sectionWithImage.imageUrl = url
            } catch (e) {
                console.error("Error getting signed url for section", e)
            }
        } else if (s.imagePath) {
            sectionWithImage.imageUrl = s.imagePath
        }
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
    await requireAdmin();
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

        revalidatePath("/admin/usuarios");
        revalidatePath("/dashboard");
        revalidatePath("/", "layout");
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
    await requireAdmin();
    try {
        const { groupIds, permissionItems, ...profileData } = data;

        // Actualizar perfil (y limpiar legado de secciones para asegurar integridad)
        await db.update(profiles)
            .set({
                ...profileData,
                assignedSectionIds: null, // Limpiamos el campo antiguo
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

        revalidatePath("/admin/usuarios");
        revalidatePath("/dashboard");
        revalidatePath("/", "layout");
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
    await requireAdmin();
    const supabaseAdmin = getAdminClient();
    try {
        await supabaseAdmin.auth.admin.deleteUser(id);
        await db.delete(profiles).where(eq(profiles.id, id));

        revalidatePath("/admin/usuarios");
        revalidatePath("/dashboard");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar", error);
        return { success: false, error: error.message };
    }
}