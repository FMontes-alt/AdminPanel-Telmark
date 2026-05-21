"use client"

import { CampaignWidget } from "@/lib/types/campaign-builder";
import { Type, Heading1, Heading2, AlignLeft } from "lucide-react";

interface TextWidgetProps {
    widget: CampaignWidget;
    onUpdate: (id: string, data: any) => void;
    isLocked?: boolean;
}

export function TextWidget({ widget, onUpdate, isLocked }: TextWidgetProps) {
    const data = widget.data as { content: string; variant?: string };
    const variant = data.variant || 'p';

    const variantStyles = {
        h1: "text-3xl font-black text-slate-900 tracking-tighter leading-tight",
        h2: "text-xl font-bold text-slate-800 tracking-tight leading-snug",
        p: "text-sm font-medium text-slate-500 leading-relaxed"
    }

    return (
        <div className={`flex flex-col bg-white group/text ${isLocked ? 'p-0 gap-0 pointer-events-none' : 'p-4 gap-4'}`}>
            {/* Selector de Variante (Mini Toolbar Interna) - Oculto si está bloqueado */}
            {!isLocked && (
                <div className="flex items-center gap-1.5 border-b border-slate-50 pb-3 opacity-0 group-hover/text:opacity-100 transition-opacity">
                    <button
                        onClick={() => onUpdate(widget.id, { ...data, variant: 'h1' })}
                        className={`p-1.5 rounded-md transition-all ${variant === 'h1' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        <Heading1 size={14} />
                    </button>
                    <button
                        onClick={() => onUpdate(widget.id, { ...data, variant: 'h2' })}
                        className={`p-1.5 rounded-md transition-all ${variant === 'h2' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        <Heading2 size={14} />
                    </button>
                    <button
                        onClick={() => onUpdate(widget.id, { ...data, variant: 'p' })}
                        className={`p-1.5 rounded-md transition-all ${variant === 'p' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        <AlignLeft size={14} />
                    </button>
                    <div className="h-4 w-[1px] bg-slate-100 mx-1" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">ESTILO</span>
                </div>
            )}
            
            {/* Input de Texto principal */}
            <textarea
                value={data.content}
                readOnly={isLocked}
                onChange={(e) => onUpdate(widget.id, { ...data, content: e.target.value })}
                placeholder={variant === 'h1' ? 'Escribe un gran título...' : 'Escribe aquí...'}
                rows={1}
                className={`w-full bg-transparent border-none focus:ring-0 p-0 resize-none transition-all placeholder:text-slate-100 ${variantStyles[variant as keyof typeof variantStyles]}`}
                style={{ height: 'auto', overflow: 'hidden' }}
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                }}
            />
        </div>
    );
}
