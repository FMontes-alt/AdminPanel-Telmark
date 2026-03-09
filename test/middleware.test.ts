import { describe, it, expect, vi } from 'vitest'
import { middleware } from '@/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Mock de variables de entorno
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Simular la sesion, para que no llame a la BD
vi.mock('../src/lib/supabase/middleware', () => ({
    updateSession: vi.fn((req) => NextResponse.next()),
}))

// Simular el cliente en Supabase
vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
    })),
}))

describe('Middlaware de Seguridad', () => {
    it('debe redigir a /login si un usuario anonimo intenta entrar en /admin',
        async () => {
            // Crear la petición falsa de /admin 
            const req = new NextRequest(new URL('http://localhost:3000/admin'))

            // Ejecutar el middlaware 
            const res = await middleware(req)

            // Verificar la respuesta (status 307 o 302)
            expect(res.status).toBe(307)
            expect(res.headers.get('location')).toContain('/login')
        })

    it('debe dejar pasar si el usuario intenta entrar en home (/)', async () => {
        // Aquí la URL debe ser la HOME, no /admin
        const req = new NextRequest(new URL('http://localhost:3000/'))
        const res = await middleware(req)

        expect(res.status).toBe(200)
    })
})