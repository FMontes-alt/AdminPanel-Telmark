import { Trash2, ShieldCheck, Zap, ArrowUpRight, AlertCircle, Lock, Unlock } from "lucide-react"

interface SectionItemProps {
    section: any
    onDelete: (id: string, name: string) => void
    onUpdate: (id: string, config: any) => void
    isDeleting: boolean
}

export function SectionItem({ section, onDelete, onUpdate, isDeleting }: SectionItemProps) {
    const config = section.config || {}
    const hasError = config.hasError || false
    const isLocked = config.isLocked || false
    const coverUrl = config.coverUrl || ""

    const toggleError = () => {
        onUpdate(section.id, { ...config, hasError: !hasError })
    }

    const toggleLock = () => {
        onUpdate(section.id, { ...config, isLocked: !isLocked })
    }

    return (
        <div className={`group relative bg-white/70 backdrop-blur-md rounded-[32px] border border-white shadow-sm hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex items-stretch gap-0 overflow-hidden ${isLocked ? "opacity-75 grayscale-[0.5]" : ""}`}>
            {/* Status Indicators */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
                {hasError && (
                    <div className="px-2 py-1 bg-rose-500 text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-rose-500/20 animate-pulse">
                        <AlertCircle size={10} strokeWidth={3} />
                        <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Error</span>
                    </div>
                )}
                {isLocked && (
                    <div className="px-2 py-1 bg-slate-900/80 text-white backdrop-blur-md rounded-lg flex items-center gap-1.5 shadow-lg shadow-slate-900/20">
                        <Lock size={10} strokeWidth={3} />
                        <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Bloqueada</span>
                    </div>
                )}
            </div>

            {/* Compact Image - Flush with edges */}
            <div className="w-28 bg-slate-100 relative shrink-0">
                {coverUrl ? (
                    <img src={coverUrl} alt={section.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
                        <Zap size={32} strokeWidth={1} />
                    </div>
                )}
                {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center">
                        <Lock className="text-white opacity-80" size={24} />
                    </div>
                )}
            </div>

            {/* Content Info - Compact Padding */}
            <div className="flex-1 min-w-0 p-5 pl-7 flex flex-col justify-center">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em]">Sección</p>
                    <h4 className="text-lg font-bold text-slate-900 tracking-tighter truncate uppercase group-hover:text-blue-600 transition-colors">
                        {section.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-semibold font-mono tracking-tight lowercase">/{section.slug}</p>
                </div>

                {/* Direct Actions row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100/30">
                    <button 
                        onClick={toggleError}
                        className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${hasError ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"} px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-100`}
                    >
                        {hasError ? "Quitar Error" : "Avisar Error"}
                    </button>
                    <button 
                        onClick={toggleLock}
                        className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${isLocked ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"} px-3 py-1.5 rounded-lg border border-transparent hover:border-amber-100`}
                    >
                        {isLocked ? "Desbloquear" : "Bloqueo Total"}
                    </button>
                </div>
            </div>

            {/* Sidebar Actions */}
            <div className="flex flex-col gap-2 p-4 justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <a 
                    href={`/admin/sections/${section.slug}`}
                    className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20"
                    title="Configurar"
                >
                    <ArrowUpRight size={16} />
                </a>
                <button 
                    onClick={() => onDelete(section.id, section.name)}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 flex items-center justify-center transition-all shadow-sm"
                    title="Eliminar"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}
