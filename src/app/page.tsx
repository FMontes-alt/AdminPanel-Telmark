import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { profiles, sections } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

import { LogoutButton } from "@/components/auth/LogoutButton"

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

    if (!user) {
        redirect('/login')
    }

    // Obtener el perfil del usuario para ver su rol y secciones
    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
    })

    if (!profile) {
        // Si no hay perfil, algo va mal, redirigimos a login
        redirect('/login')
    }

    // 1. Si es ADMIN -> Al panel de administración
    if (profile.role === 'admin' || profile.role === 'superadmin') {
        redirect('/admin')
    }

    // 2. Si es USUARIO NORMAL -> Miramos sus secciones
    const sectionIds = profile.assignedSectionIds || []

    if (sectionIds.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Sin Acceso</h1>
                        <p className="text-slate-500 font-medium mt-2">No tienes ninguna sección asignada todavía. Por favor, contacta con un administrador.</p>
                    </div>
                    <LogoutButton />
                </div>
            </div>
        )
    }

    if (sectionIds.length === 1) {
        // Solo una sección: buscamos el slug para redirigir
        const [userSection] = await db.select({ slug: sections.slug }).from(sections).where(inArray(sections.id, sectionIds))
        if (userSection) {
            redirect(`/dashboard/${userSection.slug}`)
        }
    }

    // Si tiene varias secciones o no encontramos la única, vamos a la selección
    redirect('/dashboard')
}
