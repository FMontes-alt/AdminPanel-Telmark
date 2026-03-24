import { Plus } from "lucide-react"
import { AdminPageHeader } from "@/components/ui/admin-page-header"

interface SectionsHeaderProps {
    isAdding: boolean
    onToggleAdd: () => void
}

export function SectionsHeader({ isAdding, onToggleAdd }: SectionsHeaderProps) {
    return (
        <AdminPageHeader
            category="Contenido"
            title={<>Secciones <span className="text-blue-600">Activas</span></>}
            description="Crea y administra los módulos principales de la plataforma."
        >
            <button 
                onClick={onToggleAdd}
                className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[20px] text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-500/20"
            >
                <Plus size={20} strokeWidth={3} className={isAdding ? "rotate-45 transition-transform" : "transition-transform"} />
                {isAdding ? "Cerrar" : "Nueva Sección"}
            </button>
        </AdminPageHeader>
    )
}
