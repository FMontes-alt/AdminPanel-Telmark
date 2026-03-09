import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { withAuth } from "./middlewares/auth";

export async function middleware(request: NextRequest) {
    // 1. Capa de Sesión (Bajo nivel)
    const response = await updateSession(request)

    // 2. Capa de Seguridad (RBAC)
    return await withAuth(request, response)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}