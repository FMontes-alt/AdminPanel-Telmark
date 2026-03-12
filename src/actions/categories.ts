"use server"

import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getCategories(sectionId: string) {
    return db
        .select()
        .from(categories)
        .where(eq(categories.sectionId, sectionId))
        .orderBy(categories.createdAt)
}

export async function getCategoryById(id: string) {
    const result = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1)

    return result[0] ?? null
}

// ─── CREATE ─────────────────────────────────────────────────────────────

type CreateCategoryInput = {
    sectionId: string
    name: string
    slug: string
}

export async function createCategory(data: CreateCategoryInput) {
    const [newCategory] = await db
        .insert(categories)
        .values({
            sectionId: data.sectionId,
            name: data.name,
            slug: data.slug,
        })
        .returning()

    revalidatePath("/admin")
    return newCategory
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

type UpdateCategoryInput = {
    name?: string
    slug?: string
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
    const [updated] = await db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning()

    revalidatePath("/admin")
    return updated
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteCategory(id: string) {
    await db.delete(categories).where(eq(categories.id, id))
    revalidatePath("/admin")
    return { success: true }
}
