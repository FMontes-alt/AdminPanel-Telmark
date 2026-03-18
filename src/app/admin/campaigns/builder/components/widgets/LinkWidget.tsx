"use client"

import { LinkWidgetData } from "@/lib/types/campaing-builder";
import { ExternalLink } from "lucide-react";

interface LinkWidgetProps {
    data: LinkWidgetData['data'];
    onChange: (newData: LinkWidgetData['data']) => void;
}

export function LinkWidget({ data, onChange }: LinkWidgetProps) {
    return (
        <div className="p-4 h-full flex flex-col gap-2 justify-center">
            <input
                type="text"
                placeholder="Texto del Botón"
                value={data.label || ""}
                onChange={(e) => onChange({ ...data, label: e.target.value })}
                className="text-xs font-bold border-b border-slate-100 focus:border-blue-300 outline-none p-1 placeholder:text-slate-200"
            />
            <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-100">
                <ExternalLink size={14} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="URL (https://...)"
                    value={data.url || ""}
                    onChange={(e) => onChange({ ...data, url: e.target.value })}
                    className="bg-transparent text-[10px] w-full outline-none placeholder:text-slate-300"
                />
            </div>
        </div>
    );
}
