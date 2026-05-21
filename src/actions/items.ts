"use server"

import { db } from "@/db"
import { items } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth-guard"
import { deleteFileAction } from "./storage"
import { ActionResult } from "@/lib/types/actions"
import { formatError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getItems(subcategoryId: string) {
    return db
        .select()
        .from(items)
        .where(eq(items.subcategoryId, subcategoryId))
        .orderBy(items.createdAt)
}

export async function getItemBySlug(subcategoryId: string, slug: string) {
    const result = await db
        .select()
        .from(items)
        .where(eq(items.subcategoryId, subcategoryId))
        .orderBy(items.createdAt)

    // Filtramos por slug dentro de la subcategoría (el slug es único por subcategoría)
    const item = result.find((i) => i.slug === slug)
    return item ?? null
}

export async function getItemById(id: string) {
    const result = await db
        .select()
        .from(items)
        .where(eq(items.id, id))
        .limit(1)

    return result[0] ?? null
}

// ─── CREATE ─────────────────────────────────────────────────────────────

type CreateItemInput = {
    subcategoryId: string
    title: string
    slug: string
    body?: string | null
    filePath?: string | null
    externalLink?: string | null
    contentType?: "info" | "document" | "file" | "link" | "video"
    attributes?: Record<string, unknown>
}

export async function createItem(data: CreateItemInput): Promise<ActionResult<typeof items.$inferSelect>> {
    try {
        await requireAdmin()
        const [newItem] = await db
            .insert(items)
            .values({
                subcategoryId: data.subcategoryId,
                title: data.title,
                slug: data.slug,
                body: data.body ?? null,
                filePath: data.filePath ?? null,
                externalLink: data.externalLink ?? null,
                contentType: data.contentType ?? "info",
                attributes: data.attributes ?? {},
            })
            .returning()

        revalidatePath("/admin/sections")
        revalidatePath("/")
        return { success: true, data: newItem }
    } catch (error) {
        log.error("Error creating item:", error)
        return { success: false, error: formatError(error).message }
    }
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

type UpdateItemInput = {
    title?: string
    slug?: string
    body?: string | null
    filePath?: string | null
    externalLink?: string | null
    contentType?: "info" | "document" | "file" | "link" | "video"
    attributes?: Record<string, unknown>
}

export async function updateItem(id: string, data: UpdateItemInput): Promise<ActionResult<typeof items.$inferSelect>> {
    try {
        await requireAdmin()

        // Si viene un nuevo filePath, borramos el antiguo para no dejar basura
        if (data.filePath !== undefined) {
            const oldItem = await getItemById(id)
            if (oldItem?.filePath && oldItem.filePath !== data.filePath && !oldItem.filePath.startsWith('http')) {
                try {
                    await deleteFileAction(oldItem.filePath)
                } catch (error) {
                    log.error("Error eliminando archivo antiguo al actualizar item:", error)
                }
            }
        }

        const [updated] = await db
            .update(items)
            .set(data)
            .where(eq(items.id, id))
            .returning()

        revalidatePath("/admin")
        revalidatePath("/")
        return { success: true, data: updated }
    } catch (error) {
        log.error("Error updating item:", error)
        return { success: false, error: formatError(error).message }
    }
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteItem(id: string): Promise<ActionResult> {
    try {
        await requireAdmin()
        
        // 1. Obtener el item para saber si tiene archivo
        const item = await getItemById(id)
        if (item?.filePath) {
            try {
                await deleteFileAction(item.filePath)
            } catch (error) {
                log.error("Error eliminando archivo del item:", error)
                // Continuamos con el borrado del registro aunque falle el storage
            }
        }

        await db.delete(items).where(eq(items.id, id))
        revalidatePath("/admin")
        revalidatePath("/")
        return { success: true, data: undefined }
    } catch (error) {
        log.error("Error deleting item:", error)
        return { success: false, error: formatError(error).message }
    }
}

// ─── JSONB HELPERS (Task 39) ────────────────────────────────────────────

/**
 * Actualiza un atributo ÚNICO dentro del campo JSONB `attributes`
 * sin sobreescribir el resto de atributos existentes.
 */
export async function setItemAttribute(
    itemId: string,
    key: string,
    value: unknown
): Promise<ActionResult<typeof items.$inferSelect>> {
    try {
        await requireAdmin()
        const item = await getItemById(itemId)
        if (!item) return { success: false, error: `Item con id ${itemId} no encontrado` }

        const currentAttributes = (item.attributes as Record<string, unknown>) ?? {}
        const updatedAttributes = { ...currentAttributes, [key]: value }

        return updateItem(itemId, { attributes: updatedAttributes })
    } catch (error) {
        log.error("Error setting item attribute:", error)
        return { success: false, error: formatError(error).message }
    }
}

/**
 * Elimina un atributo concreto del campo JSONB `attributes`.
 */
export async function removeItemAttribute(itemId: string, key: string): Promise<ActionResult<typeof items.$inferSelect>> {
    try {
        await requireAdmin()
        const item = await getItemById(itemId)
        if (!item) return { success: false, error: `Item con id ${itemId} no encontrado` }

        const currentAttributes = (item.attributes as Record<string, unknown>) ?? {}
        const { [key]: _, ...rest } = currentAttributes

        return updateItem(itemId, { attributes: rest })
    } catch (error) {
        log.error("Error removing item attribute:", error)
        return { success: false, error: formatError(error).message }
    }
}
