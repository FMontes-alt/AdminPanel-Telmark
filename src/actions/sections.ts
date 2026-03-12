"use server"

import { db } from "@/db"
import { sections } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getSections() {
    return db
        .select()
        .from(sections)
        .orderBy(sections.createdAt)
}

export async function getSectionBySlug(slug: string) {
    const result = await db
        .select()
        .from(sections)
        .where(eq(sections.slug, slug))
        .limit(1)

    return result[0] ?? null
}

export async function getSectionById(id: string) {
    const result = await db
        .select()
        .from(sections)
        .where(eq(sections.id, id))
        .limit(1)

    return result[0] ?? null
}

// ─── CREATE ─────────────────────────────────────────────────────────────

type CreateSectionInput = {
    name: string
    slug: string
    config?: Record<string, unknown>
}

export async function createSection(data: CreateSectionInput) {
    const [newSection] = await db
        .insert(sections)
        .values({
            name: data.name,
            slug: data.slug,
            config: data.config ?? {},
        })
        .returning()

    revalidatePath("/admin")
    return newSection
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

type UpdateSectionInput = {
    name?: string
    slug?: string
    config?: Record<string, unknown>
}

export async function updateSection(id: string, data: UpdateSectionInput) {
    const [updated] = await db
        .update(sections)
        .set(data)
        .where(eq(sections.id, id))
        .returning()

    revalidatePath("/admin")
    return updated
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteSection(id: string) {
    await db.delete(sections).where(eq(sections.id, id))
    revalidatePath("/admin")
    return { success: true }
}
