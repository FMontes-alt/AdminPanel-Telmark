"use client"

import { Search } from "lucide-react"

interface AlertsFiltersProps {
    filter: string
    setFilter: (filter: string) => void
    searchTerm: string
    setSearchTerm: (term: string) => void
}

export function AlertsFilters({ filter, setFilter, searchTerm, setSearchTerm }: AlertsFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por mensaje o sección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/70 backdrop-blur-md border border-white rounded-[30px] py-5 px-16 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                />
            </div>
            
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-[30px] border border-white shadow-inner">
                {["all", "error", "lock", "delete", "system"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                            filter === t 
                            ? "bg-white text-blue-600 shadow-xl shadow-blue-500/10" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        {t === "all" ? "Todos" : t}
                    </button>
                ))}
            </div>
        </div>
    )
}
