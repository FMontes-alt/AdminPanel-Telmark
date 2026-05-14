import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility to identify external URLs.
 */
export function getExternalUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const cleanPath = path.trim();
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://") || cleanPath.startsWith("data:")) {
      return cleanPath;
  }
  return null;
}
/**
 * Convierte una cadena en un slug válido (minúsculas, sin tildes, sin caracteres especiales).
 */
export function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina tildes
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Cambia espacios por guiones
    .replace(/[^a-z0-9-]/g, '')     // Elimina caracteres no permitidos
    .replace(/-+/g, '-');           // Elimina guiones repetidos
}
