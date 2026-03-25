import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function withAuth(request: NextRequest, response: NextResponse) {
    const { pathname } = request.nextUrl

    // Rutas de interés
    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginRoute = pathname === '/login'

    // Solo actuamos si es una ruta protegida o el login
    if (isAdminRoute || isLoginRoute) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return request.cookies.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        // 1. REDIRECCIÓN INVERSA: Si ya está logueado y va a /login, lo mandamos al admin
        if (isLoginRoute && user) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        // 2. PROTECCIÓN ADMIN: Si no hay sesión y va a /admin, al login
        if (isAdminRoute && !user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 3. RBAC: Si va a admin y hay sesión, miramos el rol
        if (isAdminRoute && user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            // Solo permitimos a los que tengan rol de administrador
            const allowedRoles = ['admin', 'superadmin'];
            const isAllowed = profile?.role && allowedRoles.includes(profile.role);

            if (!isAllowed) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
        }
    }

    return response
}