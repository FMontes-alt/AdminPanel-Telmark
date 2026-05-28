import { describe, it, expect } from 'vitest'
import { formatError } from '@/lib/error-handler'
import { sanitizeFileName, getStoragePath } from '@/lib/storage-utils'

describe('Utilities', () => {
    describe('formatError', () => {
        it('debe formatear objetos Error', () => {
            const result = formatError(new Error("test"))
            expect(result).toEqual({ message: "test" })
        })

        it('debe formatear errores tipo string', () => {
            const result = formatError("string error")
            expect(result).toEqual({ message: "string error" })
        })

        it('debe manejar errores desconocidos', () => {
            const result = formatError(42)
            expect(result).toEqual({ message: "Ha ocurrido un error inesperado." })
        })

        it('debe manejar error de Drizzle 23505', () => {
            const result = formatError({ code: '23505' })
            expect(result).toEqual({ message: "Ya existe un registro con esos datos (Violación de unicidad)." })
        })

        it('debe manejar error de Drizzle 23503', () => {
            const result = formatError({ code: '23503' })
            expect(result).toEqual({ message: "No se puede completar la operación porque hay registros que dependen de este." })
        })
    })

    describe('sanitizeFileName', () => {
        it('debe limpiar espacios y tildes', () => {
            const result = sanitizeFileName("Mi Archivo (1).pdf")
            expect(result).toMatch(/^mi_archivo__1__\d+\.pdf$/)
        })
    })

    describe('getStoragePath', () => {
        it('debe generar el formato correcto', () => {
            const result = getStoragePath('section', 'cat', 'subcat', 'file.txt')
            expect(result).toBe('section/cat/subcat/file.txt')
        })
    })
})
