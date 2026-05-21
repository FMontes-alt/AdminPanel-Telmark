import { AdminPageHeader } from "@/components/ui/admin-page-header"
import { Trash2 } from "lucide-react"

interface AlertsHeaderProps {
    alertCount: number
    unreadCount: number
    onClearAll: () => void
}

export function AlertsHeader({ alertCount, unreadCount, onClearAll }: AlertsHeaderProps) {
    return (
        <AdminPageHeader
            category="Central"
            title={<>Historial de <span className="text-blue-600">Eventos</span></>}
            description="Trazabilidad de cambios, errores y bloqueos realizados en la plataforma."
        >
            <div className="flex items-center gap-4">
                <div className="bg-white/70 backdrop-blur-md px-6 py-4 rounded-[30px] border border-white shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alertas hoy</p>
                        <p className="text-2xl font-bold text-slate-900 leading-tight">
                            {alertCount}
                        </p>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin leer</p>
                        <p className="text-2xl font-bold text-blue-600 leading-tight">
                            {unreadCount}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={onClearAll}
                    className="flex items-center justify-center gap-2 h-full px-6 py-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-[30px] transition-all duration-300 shadow-sm border border-red-100 hover:border-red-600"
                    title="Limpiar todas las alertas"
                >
                    <Trash2 size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Limpiar Todo</span>
                </button>
            </div>
        </AdminPageHeader>
    )
}
