"use server"

import { db } from "@/db"
import { sections } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { AlertService } from "@/services/alert-services"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getSections() {
    return db
        .select()
        .from(sections)
        .orderBy(sections.name)
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

    await AlertService.sectionCreated(newSection.name, newSection.id)

    revalidatePath("/admin")
    revalidatePath("/")
    return newSection
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

type UpdateSectionInput = {
    name?: string
    slug?: string
    config?: Record<string, unknown>
}

export async function updateSection(id: string, data: UpdateSectionInput) {
    const section = await getSectionById(id) // Obtenemos el nombre para la alerta
    const [updated] = await db.update(sections).set(data).where(eq(sections.id, id)).returning()
    // Lógica inteligente de alertas
    if (data.config) {
        const config = data.config as any
        const oldConfig = section?.config as any

        // ¿Ha cambiado el bloqueo?
        if (config.isLocked !== undefined && config.isLocked !== oldConfig?.isLocked) {
            config.isLocked
                ? await AlertService.sectionLocked(section!.name, id)
                : await AlertService.sectionUnlocked(section!.name, id)
        }

        // ¿Ha cambiado el estado de error?
        if (config.hasError !== undefined && config.hasError !== oldConfig?.hasError) {
            config.hasError
                ? await AlertService.sectionErrorReported(section!.name, id)
                : await AlertService.sectionErrorFixed(section!.name, id)
        }
    }
    revalidatePath("/admin")
    revalidatePath("/")
    return updated
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteSection(id: string) {
    // 1. Obtenemos la sección antes de que desaparezca
    const section = await getSectionById(id)
    const sectionName = section?.name || "Desconocida"

    await db.delete(sections).where(eq(sections.id, id))

    await AlertService.sectionDeleted(sectionName, id)

    revalidatePath("/admin")
    return { success: true }
}
