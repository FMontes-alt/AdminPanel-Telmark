import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRole } from '@/middlewares/auth'
import { createClient } from '@supabase/supabase-js'

// Mocks
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
    }))
}))

describe('Auth Middleware', () => {
    let mockSupabase: any

    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase = createClient('url', 'key')
    })

    describe('getRole', () => {
        it('debe retornar admin si el perfil tiene rol superadmin', async () => {
            mockSupabase.single.mockResolvedValueOnce({ data: { role: 'superadmin' } })
            
            const role = await getRole(mockSupabase, 'user-123')
            expect(role).toBe('admin')
            expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
        })

        it('debe retornar admin si el perfil tiene rol admin', async () => {
            mockSupabase.single.mockResolvedValueOnce({ data: { role: 'admin' } })
            
            const role = await getRole(mockSupabase, 'user-123')
            expect(role).toBe('admin')
        })

        it('debe retornar user si el perfil tiene rol usuario', async () => {
            mockSupabase.single.mockResolvedValueOnce({ data: { role: 'usuario' } })
            
            const role = await getRole(mockSupabase, 'user-123')
            expect(role).toBe('user')
        })

        it('debe usar cache en llamadas subsecuentes', async () => {
            // Primera llamada a BD
            mockSupabase.single.mockResolvedValueOnce({ data: { role: 'admin' } })
            
            const role1 = await getRole(mockSupabase, 'user-cache')
            expect(role1).toBe('admin')
            expect(mockSupabase.from).toHaveBeenCalledTimes(1)

            // Segunda llamada no debe tocar BD
            const role2 = await getRole(mockSupabase, 'user-cache')
            expect(role2).toBe('admin')
            expect(mockSupabase.from).toHaveBeenCalledTimes(1) // sigue siendo 1
        })
    })
})
