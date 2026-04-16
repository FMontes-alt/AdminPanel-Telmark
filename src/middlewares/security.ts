import { NextResponse, type NextRequest } from "next/server";

export async function withSecurity(request: NextRequest, response: NextResponse) {
    // 1.Evitar que se carge otro frame (ClickJacking)
    response.headers.set('X-Frame-Options', 'DENY');

    // 2. Protección ante XSS (inyec Scripts)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // 3. Politica de Referencia (filtrar datos de links internos)
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 4. CSP (Content Security Policy)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' blob: data: https://*.supabase.co https:;
        connect-src 'self' blob: data: https://*.supabase.co;
        media-src 'self' blob: data: https://*.supabase.co;
        frame-src 'self' https: http: blob: data:;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}