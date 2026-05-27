"use server"

import { db } from "@/db"
import { sections, categories, subcategories, items, permissions, userGroups } from "@/db/schema"
import { eq, sql, inArray, or } from "drizzle-orm"
import { requireAdmin, getCurrentUser } from "@/lib/auth-guard"
import { InferSelectModel } from "drizzle-orm"

export type SectionHierarchy = InferSelectModel<typeof sections> & {
    categories: (InferSelectModel<typeof categories> & {
        subcategories: (InferSelectModel<typeof subcategories> & {
            items: InferSelectModel<typeof items>[]
        })[]
    })[]
}

/**
 * Obtiene la jerarquía de una sección filtrada por los permisos del usuario actual
 */
export async function getFilteredHierarchy(sectionId: string) {
    const auth = await getCurrentUser()
    if (!auth) throw new Error("No autenticado")
    return fetchHierarchy(auth.user.id, sectionId)
}

/**
 * Obtiene la jerarquía COMPLETA de una sección para administración (sin filtros de permisos)
 * Puede recibir tanto el ID como el slug.
 */
export async function getSectionHierarchy(slugOrId: string): Promise<SectionHierarchy | null> {
    await requireAdmin()

    // 1. Obtener Sección
    const section = await db.query.sections.findFirst({
        where: sql`${sections.id}::text = ${slugOrId} OR ${sections.slug} = ${slugOrId}`
    })

    if (!section) return null

    // 2. Obtener Categorías
    const allCategories = await db.select().from(categories)
        .where(eq(categories.sectionId, section.id))
        .orderBy(categories.sortOrder, categories.createdAt)

    const fullHierarchy: any[] = []

    for (const cat of allCategories) {
        // Obtener subcategorías
        const allSubs = await db.select().from(subcategories)
            .where(eq(subcategories.categoryId, cat.id))
            .orderBy(subcategories.createdAt)

        const subsWithItems = []

        for (const sub of allSubs) {
            // Obtener ítems
            const allItems = await db.select().from(items)
                .where(eq(items.subcategoryId, sub.id))
                .orderBy(items.createdAt)

            subsWithItems.push({ ...sub, items: allItems })
        }

        fullHierarchy.push({ ...cat, subcategories: subsWithItems })
    }

    return JSON.parse(JSON.stringify({ ...section, categories: fullHierarchy }))
}

async function fetchHierarchy(userId: string, sectionId: string) {
    const profile = await db.query.profiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.id, userId)
    })

    if (!profile) return []

    const userGroupsQuery = await db.select({ groupId: userGroups.groupId })
        .from(userGroups)
        .where(eq(userGroups.userId, userId))

    const userGroupIds = userGroupsQuery.map(g => g.groupId)

    // 1. Obtener todos los permisos del usuario
    const allPerms = await db.select().from(permissions).where(
        or(
            eq(permissions.userId, userId),
            userGroupIds.length > 0 ? inArray(permissions.groupId, userGroupIds) : sql`FALSE`
        )
    )

    // Damos acceso total a superadmin y admin
    const isSuperAdmin = profile.role === 'superadmin' || profile.role === 'admin'

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

    return JSON.parse(JSON.stringify(filteredHierarchy))
}