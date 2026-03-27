import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "./middlewares/session";
import { withAuth } from "./middlewares/auth";
import { withSecurity } from "./middlewares/security";
import { withMaintenance } from "./middlewares/maintenance";

export async function proxy(request: NextRequest) {
    // 0. Generar el ID único para esta petición
    const traceId = crypto.randomUUID();

    // 1. Capa de Mantenimiento (Prioridad Máxima)
    let response = await withMaintenance(request, NextResponse.next());

    if (response.status !== 200) {
        return response;
    }


    // 2. Crear Cliente de Supabase único para la petición
    let supabaseResponse = response;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
            auth: {
                persistSession: false,
                detectSessionInUrl: false,
                // @ts-ignore - autoRefreshToken solo existe en algunas versiones de auth-js
                autoRefreshToken: false,
            }
        }
    )

    // 3. Capa de Sesión (Refresca el token si es necesario una sola vez)
    let user = null;
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('[Middleware] MISSING Supabase Environment Variables');
        }
        
        const sessionResult = await updateSession(request, supabase);
        user = sessionResult.user;
    } catch (error: any) {
        console.error('[Middleware] Error updating session:', error?.message || error);
        // Podemos decidir si fallar o continuar como usuario no autenticado
    }

    // 4. Capa de Seguridad (Headers)
    supabaseResponse = await withSecurity(request, supabaseResponse)

    // 5. Capa de Seguridad (RBAC)
    supabaseResponse = await withAuth(request, supabaseResponse, supabase, user)

    // 6. Inyectar Trace ID final
    supabaseResponse.headers.set('x-trace-id', traceId);

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}