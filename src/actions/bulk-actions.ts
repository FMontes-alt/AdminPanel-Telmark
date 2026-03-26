"use server"

import { db } from "@/db"
import { categories, subcategories, items } from "@/db/schema"
import { revalidatePath } from "next/cache"

function generateSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
}

type BulkItemInput = {
    title: string
    contentType: "info" | "document" | "file" | "link" | "video"
    body?: string
    externalLink?: string
    filePath?: string
    attributes?: any
}

type BulkSubcategoryInput = {
    name: string
    items: BulkItemInput[]
}

type BulkHierarchyInput = {
    sectionId: string
    categoryName: string
    subcategories: BulkSubcategoryInput[]
}

export async function bulkCreateHierarchy(data: BulkHierarchyInput) {
    try {
        const result = await db.transaction(async (tx) => {
            // 1. Create Category
            const catSlug = generateSlug(data.categoryName)
            const [newCategory] = await tx
                .insert(categories)
                .values({
                    sectionId: data.sectionId,
                    name: data.categoryName,
                    slug: catSlug,
                })
                .returning()

            const createdStructure = {
                category: newCategory,
                subcategories: [] as any[]
            }

            // 2. Create Subcategories and Items
            for (const subInput of data.subcategories) {
                const subSlug = generateSlug(subInput.name)
                const [newSub] = await tx
                    .insert(subcategories)
                    .values({
                        categoryId: newCategory.id,
                        name: subInput.name,
                        slug: subSlug,
                    })
                    .returning()

                const subEntry = {
                    ...newSub,
                    items: [] as any[]
                }

                for (const itemInput of subInput.items) {
                    const finalTitle = itemInput.title?.trim() || "Ítem sin título"
                    const itemSlug = generateSlug(finalTitle) || crypto.randomUUID().slice(0, 8)
                    
                    const [newItem] = await tx
                        .insert(items)
                        .values({
                            subcategoryId: newSub.id,
                            title: finalTitle,
                            slug: itemSlug,
                            contentType: itemInput.contentType || 'info',
                            body: itemInput.body || "",
                            externalLink: itemInput.externalLink || "",
                            filePath: itemInput.filePath || "",
                            attributes: itemInput.attributes || {},
                        })
                        .returning()
                    
                    subEntry.items.push(newItem)
                }
                
                createdStructure.subcategories.push(subEntry)
            }

            return createdStructure
        })

        revalidatePath("/admin")
        return { success: true, data: result }
    } catch (error) {
        console.error("Error in bulkCreateHierarchy:", error)
        throw new Error("No se pudo realizar la creación masiva. " + (error as any).message)
    }
}
