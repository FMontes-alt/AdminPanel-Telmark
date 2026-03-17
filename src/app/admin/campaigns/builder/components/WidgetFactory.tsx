"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder"

interface WidgetFactoryProps {
    widget: CampaignWidget;
}

export function WidgetFactory({ widget }: WidgetFactoryProps) {
    // Patrón Strategy: En el siguiente paso cada tipo tendrá su propio componente atómico
    // Por ahora renderizamos un placeholder premium acorde al estilo Admin
    return (
        <div className="p-6 flex flex-col items-center justify-center h-full text-slate-400 font-medium italic text-xs">
            <div className="mb-3 opacity-20 scale-[2] grayscale brightness-50">
                {widget.type === 'text' && "📝"}
                {widget.type === 'video' && "📹"}
                {widget.type === 'link' && "🔗"}
                {widget.type === 'pdf' && "📄"}
                {widget.type === 'stat' && "📊"}
                {widget.type === 'image' && "🖼️"}
            </div>
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-300 not-italic">
                {widget.type} - {widget.id.slice(-4)}
            </span>
        </div>
    )
}