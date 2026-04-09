"use server"

import { db } from "@/db"
import { sections, categories, subcategories, items, permissions, profiles, userGroups } from "@/db/schema"
import { eq, sql, inArray } from "drizzle-orm"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Tipos para la jerarquía
export type SectionHierarchy = typeof sections.$inferSelect & {
    categories: (typeof categories.$inferSelect & {
        subcategories: (typeof subcategories.$inferSelect & {
            items: (typeof items.$inferSelect)[]
        })[]
    })[]
}

/**
 * [ADMIN] Obtiene la jerarquía completa de una sección por su slug
 */
export async function getSectionHierarchy(slug: string): Promise<SectionHierarchy | null> {
    const section = await db.query.sections.findFirst({
        where: eq(sections.slug, slug.toLowerCase())
    })

    if (!section) return null

    const allCategories = await db.select().from(categories)
        .where(eq(categories.sectionId, section.id))
        .orderBy(categories.sortOrder, categories.createdAt)

    const categoriesWithHierarchy = await Promise.all(allCategories.map(async (cat) => {
        const allSubs = await db.select().from(subcategories)
            .where(eq(subcategories.categoryId, cat.id))
            .orderBy(subcategories.createdAt)

        const subsWithItems = await Promise.all(allSubs.map(async (sub) => {
            const its = await db.select().from(items)
                .where(eq(items.subcategoryId, sub.id))
                .orderBy(items.createdAt)
            return { ...sub, items: its }
        }))

        return { ...cat, subcategories: subsWithItems }
    }))

    return { ...section, categories: categoriesWithHierarchy }
}

/**
 * [DASHBOARD] Obtiene la jerarquía filtrada por los permisos del usuario
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

    const allPerms = await db.select().from(permissions).where(
        sql`${permissions.userId} = ${userId} OR ${permissions.groupId} IN (
            SELECT ${userGroups.groupId} FROM ${userGroups} WHERE ${userGroups.userId} = ${userId}
        )`
    )

    const isSuperAdmin = profile.role === 'superadmin'

    const allCategories = await db.select().from(categories)
        .where(eq(categories.sectionId, sectionId))
        .orderBy(categories.sortOrder, categories.createdAt)

    const filteredHierarchy = []

    for (const cat of allCategories) {
        const hasSectionPerm = allPerms.some(p => p.targetType === 'section' && p.targetId === sectionId)
        const hasCatPerm = isSuperAdmin || hasSectionPerm || allPerms.some(p => p.targetType === 'category' && p.targetId === cat.id)

        const allSubs = await db.select().from(subcategories)
            .where(eq(subcategories.categoryId, cat.id))
            .orderBy(subcategories.createdAt)

        const filteredSubs = []

        for (const sub of allSubs) {
            const hasSubPerm = hasCatPerm || allPerms.some(p => p.targetType === 'subcategory' && p.targetId === sub.id)

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