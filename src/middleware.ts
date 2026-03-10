import { type NextRequest } from "next/server";
import { updateSession } from "./middlewares/session";
import { withAuth } from "./middlewares/auth";
import { withSecurity } from "./middlewares/security";

export async function middleware(request: NextRequest) {
    // 1. Capa de Sesión (Bajo nivel)
    let response = await updateSession(request)

    // 2. Capa de Seguridad (Headers)
    response = await withSecurity(request, response)

    // 2. Capa de Seguridad (RBAC)
    return await withAuth(request, response)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}