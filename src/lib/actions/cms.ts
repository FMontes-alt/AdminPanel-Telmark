"use server"

import { db } from "@/db"
import { sections, categories, subcategories, items } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// --- SECTIONS ---

export async function getSections() {
    return await db.query.sections.findMany({
        orderBy: (sections, { asc }) => [asc(sections.name)]
    })
}

export async function createSection(name: string, slug: string, config: any = {}) {
    await db.insert(sections).values({ name, slug, config })
    revalidatePath("/admin")
    revalidatePath("/")
}

// --- CATEGORIES ---

export async function getCategoriesBySection(sectionId: string) {
    return await db.query.categories.findMany({
        where: eq(categories.sectionId, sectionId),
        orderBy: (categories, { asc }) => [asc(categories.name)]
    })
}

export async function createCategory(sectionId: string, name: string, slug: string) {
    await db.insert(categories).values({ sectionId, name, slug })
    revalidatePath(`/admin/sections/${slug}`)
}

// --- SUBCATEGORIES ---

export async function getSubcategoriesByCategory(categoryId: string) {
    return await db.query.subcategories.findMany({
        where: eq(subcategories.categoryId, categoryId),
        orderBy: (subcategories, { asc }) => [asc(subcategories.name)]
    })
}

export async function createSubcategory(categoryId: string, name: string, slug: string) {
    await db.insert(subcategories).values({ categoryId, name, slug })
    // Revalidation logic can be more specific, but for now:
    revalidatePath("/admin")
}

// --- ITEMS ---

export async function getItemsBySubcategory(subcategoryId: string) {
    return await db.query.items.findMany({
        where: eq(items.subcategoryId, subcategoryId),
        orderBy: (items, { asc }) => [asc(items.title)]
    })
}

export async function createItem(data: {
    subcategoryId: string;
    title: string;
    slug: string;
    body?: string;
    filePath?: string;
    externalLink?: string;
    contentType?: "info" | "document" | "file" | "link";
}) {
    await db.insert(items).values(data)
    revalidatePath("/admin")
    revalidatePath("/")
}
