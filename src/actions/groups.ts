"use server"

import { db } from "@/db";
import { groups, userGroups, profiles, permissions } from "@/db/schema";
import { eq, inArray, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * 1. OBTENER GRUPOS (con metadatos para visualización)
 */
export async function getGroups(search?: string, includePermissions = false) {
    try {
        let query = db.select().from(groups);
        
        if (search) {
            query = query.where(
                or(
                    ilike(groups.name, `%${search}%`),
                    ilike(groups.description, `%${search}%`)
                )
            ) as any;
        }

        const allGroups = await query.orderBy(groups.name);

        // Obtenemos conteo de miembros
        const memberCounts = await db.select({
            groupId: userGroups.groupId,
            count: sql<number>`count(*)`
        })
        .from(userGroups)
        .groupBy(userGroups.groupId);

        // Obtenemos conteo de permisos
        const permissionCounts = await db.select({
            groupId: permissions.groupId,
            count: sql<number>`count(*)`
        })
        .from(permissions)
        .where(sql`${permissions.groupId} IS NOT NULL`)
        .groupBy(permissions.groupId);

        // Obtenemos todos los permisos de grupos si se requiere
        let allGroupPerms: any[] = [];
        if (includePermissions) {
            allGroupPerms = await db.select().from(permissions).where(sql`${permissions.groupId} IS NOT NULL`);
        }

        return allGroups.map(g => ({
            ...g,
            memberCount: Number(memberCounts.find(mc => mc.groupId === g.id)?.count || 0),
            permissionCount: Number(permissionCounts.find(pc => pc.groupId === g.id)?.count || 0),
            permissions: includePermissions ? allGroupPerms.filter(p => p.groupId === g.id) : undefined
        }));
    } catch (error) {
        console.error("Error al obtener grupos:", error);
        return [];
    }
}

/**
 * 2. OBTENER GRUPO POR ID (con miembros y permisos)
 */
export async function getGroupById(id: string) {
    try {
        const group = await db.query.groups.findFirst({
            where: eq(groups.id, id),
        });

        if (!group) return null;

        const members = await db.select({
            userId: userGroups.userId,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            email: profiles.email,
        })
        .from(userGroups)
        .innerJoin(profiles, eq(userGroups.userId, profiles.id))
        .where(eq(userGroups.groupId, id));

        const groupPermissions = await db.select().from(permissions).where(eq(permissions.groupId, id));

        return { ...group, members, permissions: groupPermissions };
    } catch (error) {
        console.error("Error al obtener grupo:", error);
        return null;
    }
}

/**
 * 3. CREAR / ACTUALIZAR GRUPO
 */
export async function upsertGroup(data: {
    id?: string;
    name: string;
    description?: string;
    memberIds: string[];
    permissionItems: { targetType: "section" | "category" | "subcategory" | "item", targetId: string }[];
}) {
    try {
        let groupId = data.id;

        if (groupId) {
            // Update
            await db.update(groups).set({
                name: data.name,
                description: data.description,
                updatedAt: new Date(),
            }).where(eq(groups.id, groupId));
        } else {
            // Create
            const [newGroup] = await db.insert(groups).values({
                name: data.name,
                description: data.description,
            }).returning();
            groupId = newGroup.id;
        }

        // --- MANEJAR MIEMBROS ---
        // Borrar miembros actuales
        await db.delete(userGroups).where(eq(userGroups.groupId, groupId));
        // Insertar nuevos
        if (data.memberIds.length > 0) {
            await db.insert(userGroups).values(
                data.memberIds.map(userId => ({ userId, groupId: groupId! }))
            );
        }

        // --- MANEJAR PERMISOS ---
        // Borrar actuales
        await db.delete(permissions).where(eq(permissions.groupId, groupId));
        // Insertar nuevos
        if (data.permissionItems.length > 0) {
            await db.insert(permissions).values(
                data.permissionItems.map(p => ({
                    groupId: groupId!,
                    targetType: p.targetType,
                    targetId: p.targetId,
                }))
            );
        }

        revalidatePath("/admin/grupos");
        revalidatePath("/admin/usuarios");
        revalidatePath("/dashboard");
        revalidatePath("/", "layout");
        return { success: true, id: groupId };
    } catch (error: any) {
        console.error("Error en upsertGroup:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 4. ELIMINAR GRUPO
 */
export async function deleteGroup(id: string) {
    try {
        await db.delete(groups).where(eq(groups.id, id));
        revalidatePath("/admin/grupos");
        revalidatePath("/dashboard");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar grupo:", error);
        return { success: false, error: error.message };
    }
}
