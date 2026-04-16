import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Obtiene el perfil del usuario actual desde la sesión de Supabase y la base de datos local.
 * Esta es la fuente de verdad para la autorización en Server Actions.
 */
export async function getCurrentUser() {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {},
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return null;
    }

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
    });

    if (!profile) {
        return null;
    }

    return { user, profile };
}

/**
 * Verifica si el usuario actual tiene uno de los roles permitidos.
 * Lanza una excepción si el usuario no está autenticado o no tiene el rol necesario.
 */
export async function requireRole(allowedRoles: ("superadmin" | "admin" | "usuario")[]) {
    const auth = await getCurrentUser();

    if (!auth) {
        throw new Error("No autenticado: Inicia sesión para realizar esta acción.");
    }

    if (!allowedRoles.includes(auth.profile.role as any)) {
        throw new Error(`No autorizado: Se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`);
    }

    return auth;
}

/**
 * Atajo para requerir permisos de administración (admin o superadmin).
 */
export async function requireAdmin() {
    return requireRole(["admin", "superadmin"]);
}

/**
 * Atajo para requerir permisos de superadministrador únicamente.
 */
export async function requireSuperAdmin() {
    return requireRole(["superadmin"]);
}
