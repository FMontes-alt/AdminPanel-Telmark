"use server"

import { db } from "@/db"
import { items } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

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

export async function createItem(data: CreateItemInput) {
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
    return newItem
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

export async function updateItem(id: string, data: UpdateItemInput) {
    const [updated] = await db
        .update(items)
        .set(data)
        .where(eq(items.id, id))
        .returning()

    revalidatePath("/admin")
    revalidatePath("/")
    return updated
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteItem(id: string) {
    await db.delete(items).where(eq(items.id, id))
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
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
) {
    const item = await getItemById(itemId)
    if (!item) throw new Error(`Item con id ${itemId} no encontrado`)

    const currentAttributes = (item.attributes as Record<string, unknown>) ?? {}
    const updatedAttributes = { ...currentAttributes, [key]: value }

    return updateItem(itemId, { attributes: updatedAttributes })
}

/**
 * Elimina un atributo concreto del campo JSONB `attributes`.
 */
export async function removeItemAttribute(itemId: string, key: string) {
    const item = await getItemById(itemId)
    if (!item) throw new Error(`Item con id ${itemId} no encontrado`)

    const currentAttributes = (item.attributes as Record<string, unknown>) ?? {}
    const { [key]: _, ...rest } = currentAttributes

    return updateItem(itemId, { attributes: rest })
}
