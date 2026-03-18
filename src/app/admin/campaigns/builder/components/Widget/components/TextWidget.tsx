"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder";

interface TextWidgetProps {
    widget: CampaignWidget;
    onUpdate: (id: string, data: any) => void;
}

export function TextWidget({ widget, onUpdate }: TextWidgetProps) {
    const data = widget.data as { content: string };

    return (
        <div className="h-full w-full p-2">
            <textarea
                value={data.content}
                onChange={(e) => onUpdate(widget.id, { ...data, content: e.target.value })}
                placeholder="Escribe aquí..."
                className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-700 text-[11px] font-bold leading-relaxed resize-none p-0 placeholder:text-slate-300 placeholder:font-normal uppercase tracking-tight"
            />
        </div>
    );
}
