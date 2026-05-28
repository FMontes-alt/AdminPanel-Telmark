import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentUser, requireAdmin, requireSuperAdmin } from '@/lib/auth-guard'
import { db } from '@/db'

vi.mock('next/headers', () => ({
    cookies: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([]),
        setAll: vi.fn()
    })
}))

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn().mockImplementation(() => ({
        auth: {
            getUser: mockGetUser
        }
    }))
}))

vi.mock('@/db', () => ({
    db: {
        query: {
            profiles: {
                findFirst: vi.fn()
            }
        }
    }
}))

describe('Auth Guard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getCurrentUser', () => {
        it('debe retornar null si no hay sesión', async () => {
            mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('No session') })
            const result = await getCurrentUser()
            expect(result).toBeNull()
        })

        it('debe retornar user y profile con sesión válida', async () => {
            const mockUser = { id: '123', email: 'test@test.com' }
            const mockProfile = { id: '123', role: 'admin' }
            
            mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
            // @ts-ignore
            db.query.profiles.findFirst.mockResolvedValueOnce(mockProfile)

            const result = await getCurrentUser()
            expect(result).toEqual({ user: mockUser, profile: mockProfile })
        })
    })

    describe('requireAdmin', () => {
        it('debe lanzar excepción con rol usuario', async () => {
            const mockUser = { id: '123' }
            const mockProfile = { id: '123', role: 'usuario' }
            
            mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
            // @ts-ignore
            db.query.profiles.findFirst.mockResolvedValueOnce(mockProfile)

            await expect(requireAdmin()).rejects.toThrow('No autorizado')
        })

        it('debe retornar auth con rol admin', async () => {
            const mockUser = { id: '123' }
            const mockProfile = { id: '123', role: 'admin' }
            
            mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
            // @ts-ignore
            db.query.profiles.findFirst.mockResolvedValueOnce(mockProfile)

            const result = await requireAdmin()
            expect(result.profile.role).toBe('admin')
        })
    })

    describe('requireSuperAdmin', () => {
        it('debe lanzar excepción con rol admin', async () => {
            const mockUser = { id: '123' }
            const mockProfile = { id: '123', role: 'admin' }
            
            mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
            // @ts-ignore
            db.query.profiles.findFirst.mockResolvedValueOnce(mockProfile)

            await expect(requireSuperAdmin()).rejects.toThrow('No autorizado')
        })

        it('debe retornar auth con rol superadmin', async () => {
            const mockUser = { id: '123' }
            const mockProfile = { id: '123', role: 'superadmin' }
            
            mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
            // @ts-ignore
            db.query.profiles.findFirst.mockResolvedValueOnce(mockProfile)

            const result = await requireSuperAdmin()
            expect(result.profile.role).toBe('superadmin')
        })
    })
})
