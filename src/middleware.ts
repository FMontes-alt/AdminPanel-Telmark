import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {

    // 1. Refrescamos sesión. 
    const response = await updateSession(request)

    // 2. Creamos un cliente temporal para ver si hay un usuario logueado 
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

    // 3. Bloqueo: Si intentan entrar como admin y no tiene sesión 
    if (request.nextUrl.pathname.startsWith('/admin') && !user) {
        // TODO login no construido 
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response

}
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}