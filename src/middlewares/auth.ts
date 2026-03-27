import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function withAuth(request: NextRequest, response: NextResponse, supabase: any, user: any) {
    const { pathname } = request.nextUrl

    // Rutas de interés
    const isAdminRoute = pathname.startsWith('/admin')
    const isDashboardRoute = pathname.startsWith('/dashboard')
    const isLoginRoute = pathname === '/login'

    // Solo actuamos si es una ruta protegida o el login
    if (!isAdminRoute && !isDashboardRoute && !isLoginRoute) {
        return response
    }

    // 1. REDIRECCIÓN DESDE LOGIN: Si ya está logueado, solo mandamos a /admin si es realmente admin
    if (isLoginRoute && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
        
        if (isAdmin) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
        
        // Si es un usuario normal en /login, lo dejamos estar o mandamos a / (que ahora controlaremos)
        return response
    }

    // 2. PROTECCIÓN ADMIN: Si va a /admin
    if (isAdminRoute) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

        if (!isAdmin) {
            // REDIRIGIR A HOME (Evita bucle si ya está en /admin y corregimos / para que no mande a login si hay user)
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}