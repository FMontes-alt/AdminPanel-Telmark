import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withAuth } from '@/middlewares/auth'
import { NextRequest, NextResponse } from 'next/server'

describe('Auth Middleware', () => {
    let mockSupabase: any
    let mockResponse: NextResponse
    let mockRequest: any

    beforeEach(() => {
        vi.clearAllMocks()

        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
        }

        mockResponse = NextResponse.next()
        vi.spyOn(NextResponse, 'redirect').mockImplementation((url) => {
            return { redirected: true, url: url.toString() } as any
        })
    })

    describe('withAuth', () => {
        it('debe permitir acceso a rutas no protegidas sin tocar base de datos', async () => {
            mockRequest = { nextUrl: { pathname: '/publica' } }
            const result = await withAuth(mockRequest as any, mockResponse, mockSupabase, null)
            expect(result).toBe(mockResponse)
            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        it('debe redirigir al login si accede a /admin sin usuario', async () => {
            mockRequest = { nextUrl: { pathname: '/admin', clone: vi.fn() }, url: 'http://localhost/admin' }
            const result = await withAuth(mockRequest as any, mockResponse, mockSupabase, null)
            
            expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/login', 'http://localhost/admin'))
        })

        it('debe redirigir a / si el usuario no es admin', async () => {
            mockRequest = { nextUrl: { pathname: '/admin', clone: vi.fn() }, url: 'http://localhost/admin' }
            mockSupabase.single.mockResolvedValueOnce({ data: { role: 'user' } })
            
            const result = await withAuth(mockRequest as any, mockResponse, mockSupabase, { id: '123' })
            
            expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/', 'http://localhost/admin'))
            expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
        })

        it('debe permitir acceso a /admin si el usuario es admin', async () => {
            mockRequest = { nextUrl: { pathname: '/admin' } }
            mockSupabase.single.mockResolvedValueOnce({ data: { role: 'admin' } })
            
            const result = await withAuth(mockRequest as any, mockResponse, mockSupabase, { id: '123' })
            expect(result).toBe(mockResponse)
            expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
        })
    })
})
