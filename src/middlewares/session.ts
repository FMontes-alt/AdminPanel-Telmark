import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Capa de Sesión: Se encarga de refrescar el token de Supabase 
 * y sincronizar las cookies entre el cliente y el servidor.
 */
export async function updateSession(request: NextRequest, supabase: any) {
    // Esto refresca la sesion si ha expirado 
    const { data: { user } } = await supabase.auth.getUser()

    return { user }
}
