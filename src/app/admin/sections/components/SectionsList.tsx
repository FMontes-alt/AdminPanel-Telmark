import { SectionItem } from "./SectionItem"
import { Zap } from "lucide-react"

interface SectionsListProps {
    sections: any[]
    loading: boolean
    onDelete: (id: string, name: string) => void
    onUpdate: (id: string, config: any) => void
    onAddFirst: () => void
    isDeletingId: string | null
}

export function SectionsList({ sections, loading, onDelete, onUpdate, onAddFirst, isDeletingId }: SectionsListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100/50 rounded-[32px] animate-pulse" />
                ))}
            </div>
        )
    }

    if (sections.length === 0) {
        return (
            <div className="col-span-full py-32 text-center bg-white/40 backdrop-blur-sm rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                    <Zap size={48} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-bold text-slate-400 tracking-tighter uppercase mb-6">Sin contenido activo</h3>
                <button 
                    onClick={onAddFirst}
                    className="bg-blue-600 text-white px-10 py-4 rounded-[20px] text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
                >
                    Crear mi primera sección
                </button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {sections.map((section) => (
                <SectionItem 
                    key={section.id} 
                    section={section} 
                    onDelete={onDelete} 
                    onUpdate={onUpdate}
                    isDeleting={isDeletingId === section.id}
                />
            ))}
        </div>
    )
}
