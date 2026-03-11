import { NextResponse, type NextRequest } from "next/server";

export async function withMaintenance(request: NextRequest, response: NextResponse) {
    // 1. Comprobar que esté activo
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

    // 2. Definir la ruta de la página de aviso
    const maintenancePath = '/maintenance';

    if (isMaintenanceMode && !request.nextUrl.pathname.startsWith(maintenancePath)) {
        // Devolvemos la redirección directamente
        return NextResponse.redirect(new URL(maintenancePath, request.url));

        // TODO: Hacer una página en específico a la que redirigir
    }

    return response;
}