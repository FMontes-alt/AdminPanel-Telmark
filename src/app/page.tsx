import { redirect } from "next/navigation"

import { getDashboardData } from "@/actions/users"
import { LogoutButton } from "@/components/auth/LogoutButton"

export default async function Home() {
    const data = await getDashboardData()
    const { profile, sections: userSections } = data

    if (!profile) {
        redirect('/login')
    }

    // 1. Si es ADMIN -> Al panel de administración
    if (profile.role === 'admin' || profile.role === 'superadmin') {
        redirect('/admin')
    }

    // 2. Si es USUARIO NORMAL -> Miramos sus secciones obtenidas por el nuevo sistema
    if (userSections.length === 0) {
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

    if (userSections.length === 1) {
        // Solo una sección: redirigimos al slug correspondiente
        redirect(`/dashboard/${userSections[0].slug}`)
    }

    // Si tiene varias secciones o no encontramos la única, vamos a la selección
    redirect('/dashboard')
}
