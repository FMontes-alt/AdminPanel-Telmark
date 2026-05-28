import { describe, it, expect, vi, beforeEach } from 'vitest'
import { proxy } from '@/proxy'
import { NextRequest, NextResponse } from 'next/server'
import * as maintenance from '@/middlewares/maintenance'
import * as security from '@/middlewares/security'
import * as auth from '@/middlewares/auth'
import * as session from '@/middlewares/session'
import { createServerClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn().mockReturnValue({})
}))

vi.mock('@/middlewares/maintenance', () => ({
    withMaintenance: vi.fn()
}))

vi.mock('@/middlewares/security', () => ({
    withSecurity: vi.fn()
}))

vi.mock('@/middlewares/auth', () => ({
    withAuth: vi.fn()
}))

vi.mock('@/middlewares/session', () => ({
    updateSession: vi.fn()
}))

describe('Proxy Middleware', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequest = new NextRequest('http://localhost/test', {
            headers: new Headers()
        });
        
        // Default mocks that let the proxy chain continue
        vi.mocked(maintenance.withMaintenance).mockResolvedValue(NextResponse.next())
        vi.mocked(security.withSecurity).mockImplementation(async (req, res) => {
            res.headers.set('X-Content-Type-Options', 'nosniff');
            return res;
        })
        vi.mocked(auth.withAuth).mockImplementation(async (req, res) => res)
        vi.mocked(session.updateSession).mockResolvedValue({ user: null } as any)
    })

    it('debe detener la ejecución si withMaintenance retorna un error o redirección', async () => {
        const errorResponse = new NextResponse(null, { status: 503 })
        vi.mocked(maintenance.withMaintenance).mockResolvedValue(errorResponse)
        
        const result = await proxy(mockRequest)
        
        expect(result.status).toBe(503)
        expect(auth.withAuth).not.toHaveBeenCalled()
    })

    it('debe inyectar headers de seguridad', async () => {
        const result = await proxy(mockRequest)
        expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('debe inyectar el trace ID en la respuesta final', async () => {
        const result = await proxy(mockRequest)
        expect(result.headers.has('x-trace-id')).toBe(true)
    })
})
