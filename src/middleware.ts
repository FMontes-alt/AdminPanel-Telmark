import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./middlewares/session";
import { withAuth } from "./middlewares/auth";
import { withSecurity } from "./middlewares/security";
import { withMaintenance } from "./middlewares/maintenance";

export async function middleware(request: NextRequest) {
    // 0. Generar el ID único para esta petición
    const traceId = crypto.randomUUID();

    // 1. Capa de Mantenimiento (Prioridad Máxima)
    // Pasamos un NextResponse.next() limpio para ver si mantenimiento quiere redirigir
    let response = await withMaintenance(request, NextResponse.next());
    
    // SI HAY REDIRECCIÓN (Modo mantenimiento activo), cortamos aquí inmediatamente
    if (response.status !== 200) {
        return response;
    }

    // 2. Capa de Sesión (Supabase)
    // Si no hay mantenimiento, seguimos con la sesión
    response = await updateSession(request)

    // 3. Capa de Seguridad (Headers)
    response = await withSecurity(request, response)

    // 4. Capa de Seguridad (RBAC)
    response = await withAuth(request, response)

    // 5. Inyectar Trace ID final
    response.headers.set('x-trace-id', traceId);

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}