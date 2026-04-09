"use server"

import { db } from "@/db"
import { sections, categories, subcategories, items, permissions } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Obtiene la jerarquía de una sección filtrada por los permisos del usuario actual
 */
export async function getFilteredHierarchy(sectionId: string) {
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

    return fetchHierarchy(user.id, sectionId)
}

async function fetchHierarchy(userId: string, sectionId: string) {
    const profile = await db.query.profiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.id, userId)
    })

    if (!profile) return []

    // 1. Obtener todos los permisos del usuario
    const allPerms = await db.select().from(permissions).where(
        sql`${permissions.userId} = ${userId} OR ${permissions.groupId} IN (
            SELECT group_id FROM user_groups WHERE user_id = ${userId}
        )`
    )

    const isSuperAdmin = profile.role === 'superadmin'

    // 2. Obtener categorías
    const allCategories = await db.select().from(categories)
        .where(eq(categories.sectionId, sectionId))
        .orderBy(categories.sortOrder, categories.createdAt)

    const filteredHierarchy = []

    for (const cat of allCategories) {
        const hasCatPerm = isSuperAdmin || allPerms.some(p => p.targetType === 'section' && p.targetId === sectionId) ||
                           allPerms.some(p => p.targetType === 'category' && p.targetId === cat.id)

        // Obtener subcategorías
        const allSubs = await db.select().from(subcategories)
            .where(eq(subcategories.categoryId, cat.id))
            .orderBy(subcategories.createdAt)

        const filteredSubs = []

        for (const sub of allSubs) {
            const hasSubPerm = hasCatPerm || allPerms.some(p => p.targetType === 'subcategory' && p.targetId === sub.id)

            // Obtener ítems
            const allItems = await db.select().from(items)
                .where(eq(items.subcategoryId, sub.id))
                .orderBy(items.createdAt)

            const filteredItems = allItems.filter(item => 
                hasSubPerm || allPerms.some(p => p.targetType === 'item' && p.targetId === item.id)
            )

            if (filteredItems.length > 0 || hasSubPerm) {
                filteredSubs.push({ ...sub, items: filteredItems })
            }
        }

        if (filteredSubs.length > 0 || hasCatPerm) {
            filteredHierarchy.push({ ...cat, subcategories: filteredSubs })
        }
    }

    return filteredHierarchy
}