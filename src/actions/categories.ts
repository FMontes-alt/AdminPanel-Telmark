"use server"

import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth-guard"
import { items, subcategories } from "@/db/schema"
import { deleteMultipleFilesAction } from "./storage"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getCategories(sectionId: string) {
    return db
        .select()
        .from(categories)
        .where(eq(categories.sectionId, sectionId))
        .orderBy(categories.sortOrder, categories.createdAt)
}

export async function reorderCategories(ids: string[]) {
    await requireAdmin()
    // We update each category's sortOrder based on its index in the array
    await Promise.all(
        ids.map((id, index) => 
            db.update(categories)
                .set({ sortOrder: index })
                .where(eq(categories.id, id))
        )
    )
    revalidatePath("/admin")
    return { success: true }
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
    await requireAdmin()
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
    await requireAdmin()
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
    await requireAdmin()

    try {
        // Buscamos todos los items que cuelgan de esta categoría
        const allItems = await db
            .select({ filePath: items.filePath })
            .from(items)
            .innerJoin(subcategories, eq(items.subcategoryId, subcategories.id))
            .where(eq(subcategories.categoryId, id))

        const filePaths = allItems
            .map(i => i.filePath)
            .filter((path): path is string => !!path)

        if (filePaths.length > 0) {
            await deleteMultipleFilesAction(filePaths)
        }
    } catch (error) {
        console.error("Error limpiando storage al borrar categoría:", error)
    }

    await db.delete(categories).where(eq(categories.id, id))
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
}
