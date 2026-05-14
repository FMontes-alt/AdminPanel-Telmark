/**
 * Limpia un nombre de archivo para que sea seguro para URLs y sistemas de archivos.
 * Elimina espacios, tildes y caracteres especiales.
 */
export function sanitizeFileName(fileName: string): string {
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');

    const cleanName = nameWithoutExtension
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Elimina tildes
        .replace(/[^a-z0-9]/gi, '_')     // Cambia caracteres no alfanuméricos por guiones bajos
        .toLowerCase();

    const timestamp = Date.now();
    return `${cleanName}_${timestamp}.${extension}`;
}

/**
 * Genera la ruta jerárquica para el storage.
 * Estructura: sections/category/subcategory/filename
 */
export function getStoragePath(sectionSlug: string, categorySlug: string, subcategorySlug: string, sanitizedName: string): string {
    return `${sectionSlug}/${categorySlug}/${subcategorySlug}/${sanitizedName}`;
}
