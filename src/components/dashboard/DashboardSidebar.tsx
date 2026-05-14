"use client"

import { LayoutGrid, ArrowLeft, Target, Info } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

interface DashboardSidebarProps {
    section: any
    categories: any[]
    selectedCategoryId: string | null
    onSelectCategory: (id: string) => void
}

export function DashboardSidebar({ section, categories, selectedCategoryId, onSelectCategory }: DashboardSidebarProps) {
    return (
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full shadow-[10px_0_30px_rgba(0,0,0,0.01)] z-30 flex-shrink-0">
            {/* Compact Header */}
            <div className="p-6 space-y-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all text-[9px] font-black uppercase tracking-widest group"
                >
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors border border-transparent group-hover:border-blue-100 shadow-sm">
                        <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    Volver
                </Link>

                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <Image 
                            src="/logo.png" 
                            alt="Colectivo Prime Logo" 
                            fill 
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Colectivo Prime</span>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Consola</span>
                    </div>
                </div>
                
                <div className="space-y-1.5 pt-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest ring-1 ring-blue-500/10">
                        <Target size={8} />
                        Campaña
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight line-clamp-2">
                        {section.name}
                    </h1>
                </div>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar">
                <div className="px-3 mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Categorías</p>
                </div>
                {categories.map((cat, index) => (
                    <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${selectedCategoryId === cat.id
                                ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-500/10'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        {selectedCategoryId === cat.id && (
                            <motion.div 
                                layoutId="sidebar-active"
                                className="absolute left-0 w-1 h-5 bg-blue-600 rounded-full"
                            />
                        )}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${selectedCategoryId === cat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-100 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                            <LayoutGrid size={14} />
                        </div>
                        <span className="text-[12px] font-bold tracking-tight truncate">{cat.name}</span>
                    </motion.button>
                ))}

                {categories.length === 0 && (
                    <div className="p-6 text-center space-y-2">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center mx-auto text-slate-200">
                            <Info size={16} />
                        </div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Sin datos</p>
                    </div>
                )}
            </nav>

            {/* Compact Footer */}
            <div className="p-5 bg-slate-50/50 border-t border-slate-100/60 flex items-center gap-3">
                <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                        <Target size={14} />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Operativo</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Colectivo Prime</p>
                </div>
            </div>
        </aside>
    )
}
