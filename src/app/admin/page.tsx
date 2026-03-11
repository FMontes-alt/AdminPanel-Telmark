"use client"

import { useRouter } from "next/navigation"
import { LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "./actions"

export default function AdminDashboardPlaceholder() {
    const router = useRouter()

    async function handleLogout() {
        await logout()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">Panel de Control</h1>
                        <p className="text-sm text-slate-500">Bienvenido al entorno seguro.</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </header>

            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-700 mb-2">Construcción del Dashboard</h2>
                    <p className="text-slate-500 max-w-md">
                        El sistema de autenticación y protección de rutas está terminado.
                        Este es el punto de partida para el EPIC 7 (Admin Panel).
                    </p>
                </div>
            </main>
        </div>
    )
}
