"use server"

import { db } from "@/db";
import { sections, categories, subcategories, items, permissions, userGroups, groups } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * 1. OBTENER TODA LA HIERARQUIA PARA EL SELECTOR
 * Esto devuelve secciones con sus hijos anidados
 */
export async function getHierarchy() {
    await requireAdmin();
    try {
        const allSections = await db.select().from(sections);
        const allCategories = await db.select().from(categories);
        const allSubcategories = await db.select().from(subcategories);
        const allItems = await db.select().from(items);

        return allSections.map(s => ({
            ...s,
            type: 'section',
            children: allCategories.filter(c => c.sectionId === s.id).map(c => ({
                ...c,
                type: 'category',
                children: allSubcategories.filter(sc => sc.categoryId === c.id).map(sc => ({
                    ...sc,
                    type: 'subcategory',
                    children: allItems.filter(i => i.subcategoryId === sc.id).map(i => ({
                        ...i,
                        type: 'item',
                        name: i.title // items use title instead of name
                    }))
                }))
            }))
        }));
    } catch (error) {
        console.error("Error al obtener jerarquía:", error);
        return [];
    }
}

/**
 * 2. OBTENER PERMISOS DE UN USUARIO (Individuales + Grupos)
 */
export async function getUserPermissions(userId: string) {
    await requireAdmin();
    try {
        // 1. Permisos individuales
        const individual = await db.select().from(permissions).where(eq(permissions.userId, userId));
        
        // 2. Información de Grupos del usuario
        const userGroupsList = await db.select({ 
            groupId: userGroups.groupId,
            groupName: groups.name
        })
        .from(userGroups)
        .innerJoin(groups, eq(userGroups.groupId, groups.id))
        .where(eq(userGroups.userId, userId));

        const groupIds = userGroupsList.map(g => g.groupId);

        // 3. Permisos de sus grupos
        let fromGroups: any[] = [];
        if (groupIds.length > 0) {
            const groupPerms = await db.select().from(permissions).where(inArray(permissions.groupId, groupIds));
            // Mapeamos cada permiso con el nombre de su grupo
            fromGroups = groupPerms.map(p => {
                const group = userGroupsList.find(g => g.groupId === p.groupId);
                return { ...p, sourceName: group?.groupName || "Grupo" };
            });
        }

        return {
            individual: individual.map(p => ({ ...p, sourceName: "Individual" })),
            fromGroups,
            all: [
                ...individual.map(p => ({ ...p, sourceName: "Individual" })),
                ...fromGroups
            ]
        };
    } catch (error) {
        console.error("Error al obtener permisos de usuario:", error);
        return { individual: [], fromGroups: [], all: [] };
    }
}

/**
 * 3. ACTUALIZAR PERMISOS INDIVIDUALES
 */
export async function updateUserPermissions(userId: string, itemsList: { targetType: "section" | "category" | "subcategory" | "item", targetId: string }[]) {
    await requireAdmin();
    try {
        await db.delete(permissions).where(eq(permissions.userId, userId));
        
        if (itemsList.length > 0) {
            await db.insert(permissions).values(
                itemsList.map(p => ({
                    userId,
                    targetType: p.targetType,
                    targetId: p.targetId,
                }))
            );
        }
        
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar permisos:", error);
        return { success: false, error: error.message };
    }
}
