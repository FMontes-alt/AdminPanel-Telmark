"use client"

import React from "react"
import { Trash2, GripVertical } from "lucide-react"
import { WidgetFactory } from "../Widget/WidgetFactory"
import { CampaignWidget } from "@/lib/types/campaing-builder"

interface CanvasItemProps {
    widget: CampaignWidget;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: any) => void;
}

export function CanvasItem({ widget, onDelete, onUpdate }: CanvasItemProps) {
    return (
        <div className="h-full w-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col overflow-hidden rounded-xl">
            {/* Toolbar Minimalista */}
            <div className="h-6 bg-slate-50/50 flex items-center justify-between px-2 border-b border-slate-100 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="drag-handle flex items-center gap-1 cursor-grab active:cursor-grabbing">
                    <GripVertical size={10} className="text-slate-400" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                        {widget.type}
                    </span>
                </div>
                <button
                    onClick={() => onDelete(widget.id)}
                    className="text-slate-300 hover:text-rose-500 transition-all p-0.5"
                >
                    <Trash2 size={10} />
                </button>
            </div>
            {/* Contenido del Widget */}
            <div className="flex-1 overflow-auto bg-white p-2">
                <WidgetFactory
                    widget={widget}
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
}