"use server"

import { createClient } from "@/lib/supabase/server"
import { sanitizeFileName, getStoragePath } from "@/lib/storage-utils"
import { revalidatePath } from "next/cache"

const BUCKET_NAME = 'telmark-media'

/**
 * Sube un archivo a Supabase Storage.
 * Retorna la ruta interna si tiene éxito.
 */
export async function uploadFileAction(formData: FormData, sectionSlug: string, categorySlug: string) {
    const supabase = await createClient()
    const file = formData.get('file') as File
    
    if (!file) {
        throw new Error("No se ha proporcionado ningún archivo")
    }

    // 1. Sanitizar nombre y generar ruta
    const sanitizedName = sanitizeFileName(file.name)
    const filePath = getStoragePath(sectionSlug, categorySlug, sanitizedName)

    // 2. Subir a Supabase
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        console.error("Error subiendo archivo:", error)
        throw new Error(`Error en el servidor de almacenamiento: ${error.message}`)
    }

    return {
        path: data.path,
        fullPath: `${BUCKET_NAME}/${data.path}`
    }
}

/**
 * Genera una URL firmada (temporal) para ver un archivo privado.
 */
export async function getSignedUrlAction(path: string) {
    const supabase = await createClient()
    
    // El path no debe incluir el nombre del bucket
    const cleanPath = path.replace(`${BUCKET_NAME}/`, '')

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(cleanPath, 3600) // 1 hora de validez

    if (error) {
        console.error("Error generando URL firmada:", error)
        return null
    }

    return data.signedUrl
}

/**
 * Elimina un archivo del storage.
 */
export async function deleteFileAction(path: string) {
    const supabase = await createClient()
    const cleanPath = path.replace(`${BUCKET_NAME}/`, '')

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([cleanPath])

    if (error) {
        console.error("Error eliminando archivo:", error)
        return false
    }

    return true
}
