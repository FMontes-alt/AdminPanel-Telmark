"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LogOut, ChevronRight, User as UserIcon, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { getProfileSections } from "@/actions/users" // I'll create this or use a fetcher

import { getDashboardData } from "@/actions/users"

export default function DashboardSelectionPage() {
    const [profile, setProfile] = useState<any>(null)
    const [sections, setSections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDashboardData()
                
                if (data.profile) {
                    setProfile(data.profile)
                    setSections(data.sections)
                    
                    // Solo una sección: redirección automática
                    if (data.sections.length === 1) {
                        router.push(`/dashboard/${data.sections[0].slug}`)
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-blue-500/50 text-[10px] uppercase tracking-[0.3em] font-black">Iniciando Sistema</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-hidden relative">
            {/* Background Mesh Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[30%] right-[10%] w-[25%] h-[25%] bg-purple-600/10 blur-[100px] rounded-full animate-pulse [animation-delay:4s]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24 min-h-screen flex flex-col">
                
                {/* Header */}
                <motion.header 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between mb-20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Hub <span className="text-white">Central</span></span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{profile?.firstName} {profile?.lastName}</span>
                        </div>
                        <LogoutButton variant="link" className="text-slate-500 hover:text-white transition-colors" />
                    </div>
                </motion.header>

                {/* Main Selection */}
                <main className="flex-1 flex flex-col justify-center">
                    <div className="max-w-3xl mb-16">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-6">
                                Elige tu <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600 animate-gradient">Espacio</span>
                            </h1>
                        </motion.div>
                        <motion.p 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed"
                        >
                            Bienvenido de nuevo. Tienes acceso a {sections.length} secciones gestionadas. Selecciona una para empezar a trabajar.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.id}
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                >
                                    <Link 
                                        href={`/dashboard/${section.slug}`}
                                        className="group relative block h-full min-h-[280px] bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:border-blue-500/50"
                                    >
                                        {/* Card Decoration */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] group-hover:bg-blue-600/30 transition-all duration-700" />
                                        
                                        <div className="relative z-10 h-full flex flex-col justify-between">
                                            <div className="w-16 h-16 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-500 shadow-xl group-hover:shadow-blue-500/40">
                                                <LayoutDashboard className="w-8 h-8 text-white" />
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-blue-400 transition-colors">
                                                    {section.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300">Entrar Ahora</span>
                                                    <div className="h-px flex-1 bg-white/5 group-hover:bg-blue-500/20 transition-all" />
                                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </main>

                {/* Footer */}
                <motion.footer 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Panel Telmark &copy; 2026 — Advanced Management Suite</p>
                    <div className="flex items-center gap-8">
                        <Link href="/soporte" className="text-[10px] font-bold text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Soporte</Link>
                        <Link href="/manual" className="text-[10px] font-bold text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Manual de Usuario</Link>
                    </div>
                </motion.footer>
            </div>

            <style jsx global>{`
                @keyframes gradient-move {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient-move 5s linear infinite;
                }
            `}</style>
        </div>
    )
}
