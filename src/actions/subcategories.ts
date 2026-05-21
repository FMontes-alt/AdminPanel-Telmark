"use server"

import { db } from "@/db"
import { subcategories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth-guard"
import { items } from "@/db/schema"
import { deleteMultipleFilesAction } from "./storage"
import { ActionResult } from "@/lib/types/actions"
import { formatError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

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

export async function createSubcategory(data: CreateSubcategoryInput): Promise<ActionResult<typeof subcategories.$inferSelect>> {
    try {
        await requireAdmin()
        const [newSubcategory] = await db
            .insert(subcategories)
            .values({
                categoryId: data.categoryId,
                name: data.name,
                slug: data.slug,
            })
            .returning()

        revalidatePath("/admin")
        return { success: true, data: newSubcategory }
    } catch (error) {
        log.error("Error creating subcategory:", error)
        return { success: false, error: formatError(error).message }
    }
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

type UpdateSubcategoryInput = {
    name?: string
    slug?: string
}

export async function updateSubcategory(id: string, data: UpdateSubcategoryInput): Promise<ActionResult<typeof subcategories.$inferSelect>> {
    try {
        await requireAdmin()
        const [updated] = await db
            .update(subcategories)
            .set(data)
            .where(eq(subcategories.id, id))
            .returning()

        revalidatePath("/admin")
        return { success: true, data: updated }
    } catch (error) {
        log.error("Error updating subcategory:", error)
        return { success: false, error: formatError(error).message }
    }
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteSubcategory(id: string): Promise<ActionResult> {
    try {
        await requireAdmin()

        try {
            // Buscamos todos los items de esta subcategoría
            const allItems = await db
                .select({ filePath: items.filePath })
                .from(items)
                .where(eq(items.subcategoryId, id))

            const filePaths = allItems
                .map(i => i.filePath)
                .filter((path): path is string => !!path)

            if (filePaths.length > 0) {
                await deleteMultipleFilesAction(filePaths)
            }
        } catch (error) {
            log.error("Error limpiando storage al borrar subcategoría:", error)
        }

        await db.delete(subcategories).where(eq(subcategories.id, id))
        revalidatePath("/admin")
        revalidatePath("/")
        return { success: true, data: undefined }
    } catch (error) {
        log.error("Error deleting subcategory:", error)
        return { success: false, error: formatError(error).message }
    }
}
