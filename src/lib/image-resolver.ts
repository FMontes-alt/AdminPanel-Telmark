import { getSignedUrlAction } from "@/actions/storage";

/**
 * Resuelve una referencia de imagen (URL o Path de Storage) a una URL visualizable.
 * Si es una URL completa (http...), la devuelve tal cual.
 * Si es un path, asume que es de Supabase Storage.
 */
export async function resolveImage(path: string | null | undefined): Promise<string> {
    if (!path) return "";
    
    // Si ya es una URL completa
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Si es un path de storage, obtenemos la URL firmada (para buckets privados)
    try {
        return await getSignedUrlAction(path) || "";
    } catch (error) {
        console.error("Error resolving storage image:", error);
        return "";
    }
}
