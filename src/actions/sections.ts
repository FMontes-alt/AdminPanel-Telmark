"use server"

import { db } from "@/db"
import { AlertService } from "@/services/alerts/alert-services"
import { requireAdmin } from "@/lib/auth-guard"
import { items, sections, categories, subcategories } from "@/db/schema"
import { inArray } from "drizzle-orm"
import { deleteFileAction, deleteMultipleFilesAction } from "./storage"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getAllSectionsAction() {
    const result = await db
        .select()
        .from(sections)
        .orderBy(sections.name)
    return result
}

export async function getSectionBySlug(slug: string) {
    const result = await db
        .select()
        .from(sections)
        .where(eq(sections.slug, slug.toLowerCase()))
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
    imagePath?: string
    config?: Record<string, unknown>
}

export async function createSection(data: CreateSectionInput) {
    await requireAdmin()
    const [newSection] = await db
        .insert(sections)
        .values({
            name: data.name,
            slug: data.slug,
            imagePath: data.imagePath,
            config: data.config ?? {},
        })
        .returning()

    // --- AUTO-SEEDING para Plantillas Especializadas ---
    const config = data.config as any
    if (config?.template && config.template !== 'GENERICO') {
        const templateLabel = config.template === 'POLIZAS' ? 'Mis Pólizas' :
            config.template === 'DOCUMENTOS' ? 'Mis Documentos' :
                config.template === 'VIDEOS' ? 'Mis Vídeos' : 'General'

        // 1. Crear Categoría Inicial
        const [newCat] = await db.insert(categories).values({
            sectionId: newSection.id,
            name: templateLabel,
            slug: 'general'
        }).returning()

        // 2. Crear Subcategoría Inicial
        await db.insert(subcategories).values({
            categoryId: newCat.id,
            name: 'Principal',
            slug: 'principal'
        })
    }

    await AlertService.sectionCreated(newSection.name, newSection.id, newSection.slug)

    revalidatePath("/admin")
    revalidatePath("/")
    return newSection
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

type UpdateSectionInput = {
    name?: string
    slug?: string
    imagePath?: string
    config?: Record<string, unknown>
}

export async function updateSection(id: string, data: UpdateSectionInput) {
    await requireAdmin()
    const section = await getSectionById(id)
    
    // Si viene un nuevo imagePath, borramos el antiguo
    if (data.imagePath !== undefined && section?.imagePath && section.imagePath !== data.imagePath && !section.imagePath.startsWith('http')) {
        try {
            await deleteFileAction(section.imagePath)
        } catch (error) {
            console.error("Error eliminando imagen antigua de sección:", error)
        }
    }

    const [updated] = await db.update(sections).set(data).where(eq(sections.id, id)).returning()
    // Lógica inteligente de alertas
    if (data.config) {
        const config = data.config as any
        const oldConfig = section?.config as any

        // ¿Ha cambiado el bloqueo?
        if (config.isLocked !== undefined && config.isLocked !== oldConfig?.isLocked) {
            config.isLocked
                ? await AlertService.sectionLocked(section!.name, id, section!.slug)
                : await AlertService.sectionUnlocked(section!.name, id, section!.slug)
        }

        // ¿Ha cambiado el estado de error?
        if (config.hasError !== undefined && config.hasError !== oldConfig?.hasError) {
            config.hasError
                ? await AlertService.sectionErrorReported(section!.name, id, section!.slug)
                : await AlertService.sectionErrorFixed(section!.name, id, section!.slug)
        }
    }
    revalidatePath("/admin")
    revalidatePath("/")
    return updated
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteSection(id: string) {
    await requireAdmin()
    
    // 1. Obtenemos la sección y sus dependencias para limpiar storage
    const section = await getSectionById(id)
    if (!section) return { success: false, error: "Sección no encontrada" }
    
    const sectionName = section.name
    
    try {
        // 2. Buscamos todos los items que cuelgan de esta sección
        // Una sección -> N categorías -> N subcategorías -> N items
        const allItems = await db
            .select({ filePath: items.filePath })
            .from(items)
            .innerJoin(subcategories, eq(items.subcategoryId, subcategories.id))
            .innerJoin(categories, eq(subcategories.categoryId, categories.id))
            .where(eq(categories.sectionId, id))

        const filePaths = allItems
            .map(i => i.filePath)
            .filter((path): path is string => !!path)

        // 3. Borramos archivos de los items
        if (filePaths.length > 0) {
            await deleteMultipleFilesAction(filePaths)
        }

        // 4. Borramos la imagen de la propia sección si tiene
        if (section.imagePath) {
            await deleteFileAction(section.imagePath)
        }
    } catch (error) {
        console.error("Error en limpieza de storage al borrar sección:", error)
        // Continuamos con el borrado de la DB aunque falle el storage
    }

    // 5. Borramos de la DB (el cascade se encarga de cats, subcats e items)
    await db.delete(sections).where(eq(sections.id, id))

    await AlertService.sectionDeleted(sectionName, id)

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
}
