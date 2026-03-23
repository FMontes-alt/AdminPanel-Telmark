import { Plus, Zap } from "lucide-react"

interface SectionsHeaderProps {
    isAdding: boolean
    onToggleAdd: () => void
}

export function SectionsHeader({ isAdding, onToggleAdd }: SectionsHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-slate-100">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-1 rounded-full bg-blue-600/30" />
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Contenido</p>
                </div>
                <h2 className="text-5xl font-bold text-slate-900 tracking-tighter leading-none">
                    Secciones <span className="text-blue-600">Activas</span>
                </h2>
                <p className="text-slate-400 font-medium text-lg">Crea y administra los módulos principales de la plataforma.</p>
            </div>

            <button 
                onClick={onToggleAdd}
                className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[20px] text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-500/20"
            >
                <Plus size={20} strokeWidth={3} className={isAdding ? "rotate-45 transition-transform" : "transition-transform"} />
                {isAdding ? "Cerrar" : "Nueva Sección"}
            </button>
        </div>
    )
}
