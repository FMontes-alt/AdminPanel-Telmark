"use client"

import { Zap, Loader2 } from "lucide-react"
import { AlertItem } from "./AlertItem"
import { AnimatePresence } from "framer-motion"

interface AlertsListProps {
    alerts: any[]
    loading: boolean
    onMarkAsRead: (id: string) => void
}

export function AlertsList({ alerts, loading, onMarkAsRead }: AlertsListProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={24} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Cargando eventos...</p>
            </div>
        )
    }

    if (alerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white/50 backdrop-blur-sm rounded-[50px] border border-dashed border-slate-200">
                <div className="w-24 h-24 rounded-[35px] bg-slate-50 flex items-center justify-center text-slate-200">
                    <Zap size={64} strokeWidth={1} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">Todo bajo control</h3>
                    <p className="text-slate-400 text-sm font-medium">No hay eventos recientes que coincidan con tu búsqueda.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[48px_100px_1fr_150px_120px_160px] gap-4 px-6 py-3 bg-slate-50/50 rounded-xl mb-2 border-l-4 border-l-transparent">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</div>
                <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">Acciones</div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <AnimatePresence mode="popLayout">
                    {alerts.map((alert, index) => (
                        <AlertItem 
                            key={alert.id}
                            alert={alert}
                            index={index}
                            onMarkAsRead={onMarkAsRead}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
