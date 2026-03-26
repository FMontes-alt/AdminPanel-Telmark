"use client"

import { logout } from "@/actions/auth"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface LogoutButtonProps {
    className?: string;
    variant?: "link" | "button";
}

export function LogoutButton({ className, variant = "button" }: LogoutButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        setLoading(true)
        await logout()
        router.push("/login")
        router.refresh()
    }

    if (variant === "link") {
        return (
            <button 
                onClick={handleLogout}
                disabled={loading}
                className={className || "flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-[0.2em] transition-colors"}
            >
                <LogOut size={16} />
                {loading ? "Cerrando..." : "Desconectar cuenta"}
            </button>
        )
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className={className || "block w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all text-center"}
        >
            {loading ? "Cerrando..." : "Cerrar Sesión"}
        </button>
    )
}
