"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder";
import { ExternalLink, Type, Link as LinkIcon } from "lucide-react";

interface LinkWidgetProps {
    widget: CampaignWidget;
    onUpdate: (id: string, data: any) => void;
}

export function LinkWidget({ widget, onUpdate }: LinkWidgetProps) {
    const data = widget.data as { url: string; label: string };

    return (
        <div className="h-full w-full p-2 flex flex-col gap-1">
            <div className="space-y-0.5">
                <input
                    type="text"
                    value={data.label}
                    onChange={(e) => onUpdate(widget.id, { ...data, label: e.target.value })}
                    placeholder="ETIQUETA..."
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-800 text-[9px] font-black p-0 placeholder:text-slate-200 uppercase"
                />
            </div>

            <div className="space-y-0.5">
                <input
                    type="text"
                    value={data.url}
                    onChange={(e) => onUpdate(widget.id, { ...data, url: e.target.value })}
                    placeholder="URL DESTINO..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-none py-1 px-2 text-[8px] font-bold focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                />
            </div>

            <div className="pt-1">
                <div className="w-full py-1.5 bg-slate-900 flex items-center justify-center gap-2 text-white font-black text-[8px] uppercase tracking-widest">
                    <ExternalLink size={10} />
                    {data.label || 'LINK'}
                </div>
            </div>
        </div>
    );
}
