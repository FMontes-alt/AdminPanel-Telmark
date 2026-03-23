"use client"

import React from "react"
import { Trash2, GripVertical, Check, Lock, Unlock } from "lucide-react"
import { WidgetFactory } from "../Widget/WidgetFactory"
import { CampaignWidget } from "@/lib/types/campaing-builder"

interface CanvasItemProps {
    widget: CampaignWidget;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: any) => void;
    onAdjust: (id: string) => void;
}

export function CanvasItem({ widget, onDelete, onUpdate, onAdjust }: CanvasItemProps) {
    const isLocked = widget.isLocked;
    return (
        <div className={`h-full w-full bg-white transition-all group flex flex-col overflow-hidden rounded-2xl relative border-2 ${isLocked
            ? 'border-blue-500 shadow-lg'
            : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200'
            }`}>

            {/* Toolbar Dinámica */}
            <div className={`absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-3 border-b backdrop-blur-sm transition-all z-20 ${isLocked
                ? 'bg-blue-500 text-white opacity-100'
                : 'bg-white/90 border-slate-100 opacity-0 group-hover:opacity-100'
                }`}>
                <div className="drag-handle flex items-center gap-2 cursor-grab active:cursor-grabbing">
                    <GripVertical size={12} className={isLocked ? 'text-blue-100' : 'text-slate-400'} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isLocked ? 'text-white' : 'text-slate-600'}`}>
                        {isLocked ? 'CONFIRMADO' : widget.type}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Botón de Bloqueo / Desbloqueo */}
                    <button
                        onClick={() => onAdjust(widget.id)}
                        className={`rounded-full p-1 transition-all ${isLocked
                            ? 'bg-white/20 text-white hover:bg-white/30'
                            : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                        title={isLocked ? "Desbloquear edición" : "Confirmar y bloquear"}
                    >
                        {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    {/* Botón de borrar (sólo si no está bloqueado, por seguridad) */}
                    {!isLocked && (
                        <button
                            onClick={() => onDelete(widget.id)}
                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full p-1 transition-all"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>
            {/* Contenido */}
            <div
                id={`widget-content-${widget.id}`}
                className={`flex-1 overflow-auto bg-white transition-all ${
                    isLocked
                        ?'pt-8 pb-8'
                        : 'pt-2 group-hover:pt-8'
                    }`}
            >
                <WidgetFactory
                    widget={widget}
                    onUpdate={onUpdate}
                    isLocked={isLocked}
                />
            </div>
            {/* Tirador visual de redimensionamiento (oculto si está bloqueado) */}
            {!isLocked && (
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-slate-200 rounded-br-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </div>
    );
}