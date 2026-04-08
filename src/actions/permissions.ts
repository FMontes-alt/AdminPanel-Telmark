"use server"

import { db } from "@/db";
import { sections, categories, subcategories, items, permissions, userGroups } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * 1. OBTENER TODA LA HIERARQUIA PARA EL SELECTOR
 * Esto devuelve secciones con sus hijos anidados
 */
export async function getHierarchy() {
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
    try {
        // Individuales
        const individual = await db.select().from(permissions).where(eq(permissions.userId, userId));
        
        // De sus grupos
        const userGroupIds = (await db.select({ id: userGroups.groupId })
            .from(userGroups)
            .where(eq(userGroups.userId, userId)))
            .map(g => g.id);

        let groupPerms: any[] = [];
        if (userGroupIds.length > 0) {
            groupPerms = await db.select().from(permissions).where(inArray(permissions.groupId, userGroupIds));
        }

        return {
            individual,
            fromGroups: groupPerms,
            all: [...individual, ...groupPerms]
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
        
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar permisos:", error);
        return { success: false, error: error.message };
    }
}
