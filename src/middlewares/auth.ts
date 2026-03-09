import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function withAuth(request: NextRequest, response: NextResponse) {
    const { pathname } = request.nextUrl

    // Solo se actúa si la ruta es admin
    if (pathname.startsWith('/admin')) {
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

        // 1. Bloqueo si no hay sesión
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 2. Bloqueo por rol (RBAC)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const isAllowed = profile?.role === 'admin' || profile?.role === 'superadmin'

        if (!isAllowed) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}