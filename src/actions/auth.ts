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
                        // Ignoring setAll error on server components
                    }
                },
            },
        }
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
            return { error: "El correo o la contraseña no son correctos. Por favor, inténtalo de nuevo." }
        }
        if (authError.message.includes("Email not confirmed")) {
            return { error: "Tu correo electrónico aún no ha sido confirmado." }
        }
        if (authError.message.includes("too many requests")) {
            return { error: "Demasiados intentos. Por favor, espera un momento antes de volver a intentarlo." }
        }
        return { error: "Ha ocurrido un error al intentar iniciar sesión. Por favor, contacta con soporte." }
    }

    // Una vez logueado, obtenemos el rol del usuario para redirigir correctamente
    if (authData.user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single()

        return { success: true, role: profile?.role || 'usuario' }
    }

    return { success: true, role: 'usuario' }
}
