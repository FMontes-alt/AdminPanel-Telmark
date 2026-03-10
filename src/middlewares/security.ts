import { NextResponse, type NextRequest } from "next/server";

export async function withSecurity(request: NextRequest, response: NextResponse) {
    // 1.Evitar que se carge otro frame (ClickJacking)
    response.headers.set('X-Frame-Options', 'DENY');

    // 2. Protección ante XSS (inyec Scripts)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // 3. Politica de Referencia (filtrar datos de links internos)
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}