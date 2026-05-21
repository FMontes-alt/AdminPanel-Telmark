"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Construction } from "lucide-react"
import { motion } from "framer-motion"

export default function SoportePage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600">
            {/* Decorative Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 max-w-md w-full bg-white border border-slate-200/60 p-10 rounded-[40px] shadow-2xl shadow-slate-200/40 text-center flex flex-col items-center"
            >
                {/* Logo */}
                <div className="relative w-24 h-24 mb-8">
                    <Image 
                        src="/logo.png" 
                        alt="Colectivo Prime Logo" 
                        fill 
                        className="object-contain"
                    />
                </div>

                {/* Icon & Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    <Construction size={14} />
                    Módulo de Soporte
                </div>

                {/* Text Content */}
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
                    En <span className="text-blue-600">Construcción</span>
                </h1>
                
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 max-w-xs">
                    Estamos trabajando para ofrecerte la mejor experiencia de soporte. Esta sección estará disponible próximamente.
                </p>

                {/* Action Button */}
                <Link 
                    href="/dashboard"
                    className="group flex items-center justify-center gap-3 w-full bg-slate-900 text-white hover:bg-blue-600 rounded-2xl py-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Volver al inicio</span>
                </Link>
            </motion.div>
        </div>
    )
}
