"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function login(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { error: "Por favor, introduce tu email y contraseña." }
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // Mensajes más amigables en español
        if (error.message.includes("Invalid login credentials")) {
            return { error: "El correo o la contraseña no son correctos. Por favor, inténtalo de nuevo." }
        }
        if (error.message.includes("Email not confirmed")) {
            return { error: "Tu correo electrónico aún no ha sido confirmado." }
        }
        if (error.message.includes("too many requests")) {
            return { error: "Demasiados intentos. Por favor, espera un momento antes de volver a intentarlo." }
        }
        return { error: "Ha ocurrido un error al intentar iniciar sesión. Por favor, contacta con soporte." }
    }

    // El middleware se encargará de redirigir a /admin u otra ruta
    // si intentamos acceder directamente, pero aquí forzamos la recarga al home
    // o podríamos retornar 'success' y que el cliente haga router.push
    return { success: true }
}
