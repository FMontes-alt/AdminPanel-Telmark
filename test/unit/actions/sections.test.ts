import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSection, getSectionById, deleteSection } from '@/actions/sections'
import { db } from '@/db'
import { requireAdmin } from '@/lib/auth-guard'
import { AlertService } from '@/services/alerts/alert-services'

vi.mock('@/lib/auth-guard', () => ({
    requireAdmin: vi.fn()
}))

vi.mock('@/services/alerts/alert-services', () => ({
    AlertService: {
        sectionCreated: vi.fn(),
        sectionDeleted: vi.fn(),
    }
}))

describe('Sections Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createSection', () => {
        it('debe requerir permisos de admin', async () => {
            await createSection({ name: 'Test', slug: 'test' })
            expect(requireAdmin).toHaveBeenCalled()
        })

        it('debe crear una sección y retornar éxito', async () => {
            const mockSection = { id: 'sec-1', name: 'Test', slug: 'test' }
            
            // @ts-ignore
            db.returning.mockResolvedValueOnce([mockSection])
            
            const result = await createSection({ name: 'Test', slug: 'test' })
            
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(mockSection)
            }
            expect(AlertService.sectionCreated).toHaveBeenCalledWith('Test', 'sec-1', 'test')
        })

        it('debe manejar errores y retornar false', async () => {
            // @ts-ignore
            db.returning.mockRejectedValueOnce(new Error('DB Error'))
            
            const result = await createSection({ name: 'Test', slug: 'test' })
            
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('DB Error')
            }
        })
    })

    describe('deleteSection', () => {
        it('debe fallar si la sección no existe', async () => {
            // mock de getSectionById (que internamente llama a db.select()...)
            // @ts-ignore
            db.limit.mockResolvedValueOnce([])
            
            const result = await deleteSection('not-found')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('Sección no encontrada')
            }
        })

        it('debe borrar la sección y notificar', async () => {
            // @ts-ignore
            db.limit.mockResolvedValueOnce([{ id: 'sec-2', name: 'To Delete' }]) // getSectionById
            // @ts-ignore
            db.innerJoin.mockReturnThis() // from(items).innerJoin...
            // @ts-ignore
            db.where.mockResolvedValueOnce([]) // allItems = []
            
            const result = await deleteSection('sec-2')
            
            expect(result.success).toBe(true)
            expect(AlertService.sectionDeleted).toHaveBeenCalledWith('To Delete', 'sec-2')
            expect(db.delete).toHaveBeenCalled()
        })
    })
})
