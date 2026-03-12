"use server"

import { db } from "@/db"
import { subcategories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getSubcategories(categoryId: string) {
    return db
        .select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, categoryId))
        .orderBy(subcategories.createdAt)
}

export async function getSubcategoryById(id: string) {
    const result = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.id, id))
        .limit(1)

    return result[0] ?? null
}

// ─── CREATE ─────────────────────────────────────────────────────────────

type CreateSubcategoryInput = {
    categoryId: string
    name: string
    slug: string
}

export async function createSubcategory(data: CreateSubcategoryInput) {
    const [newSubcategory] = await db
        .insert(subcategories)
        .values({
            categoryId: data.categoryId,
            name: data.name,
            slug: data.slug,
        })
        .returning()

    revalidatePath("/admin")
    return newSubcategory
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

type UpdateSubcategoryInput = {
    name?: string
    slug?: string
}

export async function updateSubcategory(id: string, data: UpdateSubcategoryInput) {
    const [updated] = await db
        .update(subcategories)
        .set(data)
        .where(eq(subcategories.id, id))
        .returning()

    revalidatePath("/admin")
    return updated
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteSubcategory(id: string) {
    await db.delete(subcategories).where(eq(subcategories.id, id))
    revalidatePath("/admin")
    return { success: true }
}
