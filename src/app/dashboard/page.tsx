"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LogOut, ChevronRight, User as UserIcon, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LogoutButton } from "@/components/auth/LogoutButton"


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
            {/* Background Sophistication */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse [animation-delay:4s]" />
                
                {/* Thin Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20 min-h-screen flex flex-col">
                
                {/* Header */}
                <motion.header 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between mb-24"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 relative group">
                            <div className="absolute inset-0 bg-blue-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
                            <Sparkles className="text-white w-6 h-6 relative z-10" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 leading-none">Telmark</span>
                            <span className="text-xl font-black uppercase tracking-tighter text-white">Hub<span className="text-blue-500">Central</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Sesión Activa</p>
                            <span className="text-sm font-bold text-white tracking-tight">{profile?.firstName} {profile?.lastName}</span>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden md:block" />
                        <LogoutButton variant="link" className="text-slate-500 hover:text-white transition-colors group flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest">Desconectar</span>
                            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </LogoutButton>
                    </div>
                </motion.header>

                {/* Main Selection */}
                <main className="flex-1 flex flex-col justify-center">
                    <div className="max-w-4xl mb-20">
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-8">
                                Gestión de <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600 animate-gradient inline-block">Procesos</span>
                            </h1>
                        </motion.div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-12 h-px bg-blue-500/50" />
                            <p className="text-slate-400 text-xl font-medium tracking-tight">
                                Tienes acceso a <span className="text-white font-bold">{sections.length} unidades</span> de negocio activas.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.id}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                                    whileHover={{ y: -12, transition: { duration: 0.4 } }}
                                >
                                    <Link 
                                        href={`/dashboard/${section.slug}`}
                                        className="group relative block h-full min-h-[320px] bg-[#0c0c0c] border border-white/5 rounded-[48px] p-12 overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:bg-[#111111] shadow-2xl"
                                    >
                                        {/* Dynamic Hover Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/10 transition-all duration-700" />
                                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all duration-1000" />
                                        
                                        <div className="relative z-10 h-full flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-500 shadow-2xl group-hover:shadow-blue-500/50">
                                                    <LayoutDashboard className="w-10 h-10 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">Online</span>
                                                    </div>
                                                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-none group-hover:text-blue-400 transition-colors">
                                                        {section.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest line-clamp-2 leading-relaxed">
                                                    Accede a las herramientas y documentación de {section.name}.
                                                </p>
                                                <div className="flex items-center gap-4 pt-4">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white whitespace-nowrap">Abrir Terminal</span>
                                                    <div className="h-px flex-1 bg-white/10 group-hover:bg-blue-500/30 transition-all" />
                                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all group-hover:translate-x-2">
                                                        <ChevronRight className="w-5 h-5 text-white" />
                                                    </div>
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
                    transition={{ delay: 1.2 }}
                    className="mt-24 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Neural Network Active — v4.2.0</p>
                    </div>
                    <div className="flex items-center gap-10">
                        <Link href="/soporte" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] transition-colors">Soporte Critico</Link>
                        <Link href="/manual" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] transition-colors">Centro de Aprendizaje</Link>
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
                    animation: gradient-move 8s linear infinite;
                }
            `}</style>
        </div>
    )
}
