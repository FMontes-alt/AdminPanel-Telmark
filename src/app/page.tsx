import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
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
                        // Ignorado en server components
                    }
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Si hay usuario pero ha llegado aquí es porque NO tiene rol admin (el middleware le habría mandado a /admin)
        // O simplemente quiere ver la landing. Por ahora mostramos un mensaje para romper el bucle.
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 max-w-md text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Restringido</h1>
                    <p className="text-slate-500 text-sm mb-6">Tu cuenta no tiene permisos suficientes para acceder al panel de administración.</p>
                    <a href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all">
                        Cerrar Sesión e Intentar de Nuevo
                    </a>
                </div>
            </div>
        )
    }

    // Si no hay usuario, vamos al login
    redirect('/login')
}
