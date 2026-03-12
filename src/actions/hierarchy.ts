"use server"

import { db } from "@/db"
import { sections, categories, subcategories, items } from "@/db/schema"
import { eq } from "drizzle-orm"

// ─── TIPOS ──────────────────────────────────────────────────────────────

type ItemNode = {
    id: string
    title: string
    slug: string
    body: string | null
    filePath: string | null
    externalLink: string | null
    contentType: string | null
    attributes: unknown
}

type SubcategoryNode = {
    id: string
    name: string
    slug: string
    items: ItemNode[]
}

type CategoryNode = {
    id: string
    name: string
    slug: string
    subcategories: SubcategoryNode[]
}

export type SectionHierarchy = {
    id: string
    name: string
    slug: string
    config: unknown
    categories: CategoryNode[]
}

// ─── FETCHER PRINCIPAL ──────────────────────────────────────────────────

/**
 * Devuelve el árbol jerárquico COMPLETO de una sección dado su slug.
 *
 * Estructura devuelta:
 * Section
 *   └── Category[]
 *         └── Subcategory[]
 *               └── Item[]
 *
 * Se realizan 4 consultas secuenciales (una por nivel) y se ensambla
 * el árbol en memoria. Es más eficiente que JOINs anidados para este
 * volumen de datos y permite caché granular en el futuro.
 */
export async function getSectionHierarchy(sectionSlug: string): Promise<SectionHierarchy | null> {
    // 1. Buscar la sección por slug
    const [section] = await db
        .select()
        .from(sections)
        .where(eq(sections.slug, sectionSlug))
        .limit(1)

    if (!section) return null

    // 2. Obtener las categorías de esa sección
    const sectionCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.sectionId, section.id))
        .orderBy(categories.createdAt)

    if (sectionCategories.length === 0) {
        return { ...section, categories: [] }
    }

    // 3. Obtener las subcategorías de todas las categorías (en una sola query)
    const categoryIds = sectionCategories.map((c) => c.id)
    const allSubcategories = await db
        .select()
        .from(subcategories)
        .orderBy(subcategories.createdAt)

    const filteredSubcategories = allSubcategories.filter((sc) =>
        categoryIds.includes(sc.categoryId)
    )

    // 4. Obtener los items de todas las subcategorías
    const subcategoryIds = filteredSubcategories.map((sc) => sc.id)
    const allItems = await db
        .select()
        .from(items)
        .orderBy(items.createdAt)

    const filteredItems = allItems.filter((item) =>
        subcategoryIds.includes(item.subcategoryId)
    )

    // 5. Ensamblar el árbol
    const tree: SectionHierarchy = {
        id: section.id,
        name: section.name,
        slug: section.slug,
        config: section.config,
        categories: sectionCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            subcategories: filteredSubcategories
                .filter((sc) => sc.categoryId === cat.id)
                .map((sc) => ({
                    id: sc.id,
                    name: sc.name,
                    slug: sc.slug,
                    items: filteredItems
                        .filter((item) => item.subcategoryId === sc.id)
                        .map((item) => ({
                            id: item.id,
                            title: item.title,
                            slug: item.slug,
                            body: item.body,
                            filePath: item.filePath,
                            externalLink: item.externalLink,
                            contentType: item.contentType,
                            attributes: item.attributes,
                        })),
                })),
        })),
    }

    return tree
}