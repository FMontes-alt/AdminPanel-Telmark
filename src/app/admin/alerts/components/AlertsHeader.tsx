"use client"

import { ShieldAlert } from "lucide-react"

interface AlertsHeaderProps {
    alertCount: number
    unreadCount: number
}

export function AlertsHeader({ alertCount, unreadCount }: AlertsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[20px] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.25em]">Centro de Control</p>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">Historial de <span className="text-blue-600">Eventos</span></h1>
                    </div>
                </div>
                <p className="text-slate-400 text-sm max-w-md font-medium">Trazabilidad de cambios, errores y bloqueos realizados en la plataforma.</p>
            </div>

            <div className="flex items-center gap-3">
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
            </div>
        </div>
    )
}
