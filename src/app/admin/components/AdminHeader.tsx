"use client"

import { LogOut, Search, User, Eye, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "../actions"
import { useRouter } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"

export function AdminHeader() {
    const router = useRouter()
    const { scrollY } = useScroll()
    const [hidden, setHidden] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0
        if (latest > previous && latest > 150) {
            setHidden(true)
        } else {
            setHidden(false)
        }
    })

    async function handleLogout() {
        await logout()
        router.push("/login")
        router.refresh()
    }

    return (
        <motion.header 
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[50] px-6 flex items-center justify-between"
        >
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-sm w-full hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar contenido..." 
                        className="w-full bg-slate-100 border-none rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Mode Switcher Placeholder */}
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 mr-2">
                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white shadow-sm text-blue-600 transition-all">
                        <Eye size={12} />
                        Vista
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all">
                        <Edit3 size={12} />
                        Gestion
                    </button>
                </div>

                <div className="w-[1px] h-6 bg-slate-200 mx-2 hidden sm:block" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                >
                    <LogOut className="w-4 h-4" />
                </Button>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border border-white shadow-sm flex items-center justify-center text-blue-600">
                    <User size={16} />
                </div>
            </div>
        </motion.header>
    )
}
