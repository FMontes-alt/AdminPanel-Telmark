"use client"

import { Search, Sparkles } from "lucide-react"

interface DashboardHeaderProps {
    sectionName: string
    searchTerm: string
    onSearchChange: (value: string) => void
}

export function DashboardHeader({ sectionName, searchTerm, onSearchChange }: DashboardHeaderProps) {
    const today = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    })

    return (
        <header className="px-10 py-8 border-b border-slate-100/60 flex items-center justify-between gap-12 bg-white/80 backdrop-blur-xl z-20 sticky top-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex-1 max-w-3xl relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
                    <Search size={20} />
                </div>
                <input
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder={`¿Qué información necesitas sobre ${sectionName}?`}
                    className="w-full bg-slate-50/50 border-2 border-transparent focus:bg-white focus:border-blue-500/10 rounded-[28px] py-4 pl-14 pr-8 text-[13px] outline-none transition-all duration-500 font-medium placeholder:text-slate-400 shadow-inner"
                />
            </div>

            <div className="hidden lg:flex items-center gap-10">
                <div className="flex items-center gap-4 py-2 px-5 bg-slate-50/50 rounded-2xl border border-slate-100/60">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                            {today}
                        </p>
                        <div className="flex items-center justify-end gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sincronizado</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
