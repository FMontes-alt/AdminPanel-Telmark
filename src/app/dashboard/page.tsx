"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LogOut, ChevronRight, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { getDashboardData } from "@/actions/users"
import Image from "next/image"

const MOTIVATIONAL_QUOTES = [
    { text: "El camino al éxito es la actitud", top: "15%", left: "5%", rotate: "-5deg" },
    { text: "No levantes la voz, mejora tu argumento", top: "25%", left: "70%", rotate: "3deg" },
    { text: "La disciplina es el puente entre metas y logros", top: "45%", left: "15%", rotate: "-2deg" },
    { text: "Tu única competencia eres tú mismo", top: "60%", left: "75%", rotate: "5deg" },
    { text: "Haz que ocurra", top: "80%", left: "10%", rotate: "-8deg" },
    { text: "El éxito es la suma de pequeños esfuerzos", top: "10%", left: "80%", rotate: "2deg" },
    { text: "Enfócate en la solución, no en el problema", top: "70%", left: "40%", rotate: "4deg" },
    { text: "La constancia es la clave", top: "90%", left: "60%", rotate: "-3deg" }
]

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
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        // Polling silencioso cada 10 segundos para actualizar los estados de bloqueo/error en tiempo real
        const intervalId = setInterval(() => {
            fetchData()
        }, 10000)

        return () => clearInterval(intervalId)
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando campañas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600/10 selection:text-blue-600 overflow-hidden relative">
            
            {/* Background Decorative Quotes */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
                {MOTIVATIONAL_QUOTES.map((quote, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.04 }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className="absolute whitespace-nowrap text-[4vw] font-black uppercase tracking-tighter text-slate-900"
                        style={{ 
                            top: quote.top, 
                            left: quote.left, 
                            transform: `rotate(${quote.rotate})`,
                        }}
                    >
                        {quote.text}
                    </motion.div>
                ))}
            </div>

            {/* Compact Minimalist Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <Image 
                                src="/logo.png" 
                                alt="Colectivo Prime Logo" 
                                fill 
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Colectivo Prime</p>
                            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Gestión de <span className="text-blue-600">Campañas</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Usuario Activo</span>
                            <span className="text-xs font-black text-slate-900">{profile?.firstName} {profile?.lastName}</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                        <LogoutButton className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all group !w-auto !bg-transparent">
                            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </LogoutButton>
                    </div>
                </div>
            </header>

            {/* Optimized Content Area */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 py-6 lg:py-8">
                <div className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                            <Users size={10} />
                            Módulo de Operadores
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            Selecciona tu <br />
                            <span className="text-blue-600">Campaña Activa</span>
                        </h1>
                        <p className="text-slate-500 text-[13px] font-medium max-w-xl leading-relaxed">
                            Bienvenido de nuevo, <span className="text-slate-900 font-bold">{profile?.firstName}</span>. Tienes acceso a <span className="text-slate-900 font-bold">{sections.length} campañas operativas</span>.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    <AnimatePresence>
                        {sections.map((section, index) => {
                            const config = section.config || {}
                            const isLocked = config.isLocked === true
                            const hasError = config.hasError === true

                            let statusText = "Operativo"
                            let statusDot = "bg-emerald-500"
                            let statusTextClass = "text-emerald-600/70"

                            if (isLocked) {
                                statusText = "Bloqueado"
                                statusDot = "bg-red-500"
                                statusTextClass = "text-red-600/70"
                            } else if (hasError) {
                                statusText = "Con Errores"
                                statusDot = "bg-amber-500"
                                statusTextClass = "text-amber-600/70"
                            }

                            const CardWrapper = (isLocked ? "div" : Link) as any
                            const cardProps = isLocked ? {} : { href: `/dashboard/${section.slug}` }

                            return (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                <CardWrapper 
                                    {...cardProps}
                                    className={`group block relative bg-white border border-slate-200 rounded-[28px] p-5 transition-all duration-300 overflow-hidden shadow-sm ${
                                        isLocked 
                                        ? 'opacity-75 cursor-not-allowed grayscale-[0.5]' 
                                        : 'hover:shadow-lg hover:shadow-slate-200/60 hover:border-blue-600/20 cursor-pointer'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-blue-50/10 group-hover:to-white/50 transition-all duration-500 z-0" />
                                    
                                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[120px]">
                                        <div className="space-y-4">
                                            {/* Spacer to maintain card dimensions when image is used as background header */}
                                            {section.imageUrl ? (
                                                <div className="h-10 w-full" /> 
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                    <LayoutDashboard size={20} />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1 h-1 rounded-full ${statusDot}`} />
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${statusTextClass}`}>{statusText}</span>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                                                    {section.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between group-hover:border-blue-100 transition-colors">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                                                {isLocked ? 'Acceso Denegado' : 'Entrar'}
                                            </span>
                                            {!isLocked && (
                                                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:translate-x-1">
                                                    <ChevronRight size={12} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Background Header Image - Placed last so it's beneath everything via z-index but renders properly */}
                                    {section.imageUrl && (
                                        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-[28px]">
                                            <img 
                                                src={section.imageUrl} 
                                                alt={section.name} 
                                                className={`block absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 transform-gpu origin-center ${
                                                    isLocked ? 'opacity-30' : 'opacity-50 group-hover:opacity-70 group-hover:scale-105'
                                                }`} 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />
                                        </div>
                                    )}
                                </CardWrapper>
                            </motion.div>
                        )})}
                    </AnimatePresence>
                </div>
            </main>

            <footer className="relative z-10 max-w-6xl mx-auto px-6 py-6 border-t border-slate-200 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 opacity-60">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Colectivo Prime Systems — Campañas v4.2.0</p>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/soporte" className="text-[8px] font-black text-slate-600 hover:text-blue-600 uppercase tracking-widest transition-colors">Soporte</Link>
                    <Link href="/manual" className="text-[8px] font-black text-slate-600 hover:text-blue-600 uppercase tracking-widest transition-colors">Guía</Link>
                </div>
            </footer>
        </div>
    )
}
