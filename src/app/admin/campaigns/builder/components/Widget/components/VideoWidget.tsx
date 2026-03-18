"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder";
import { Video, Youtube } from "lucide-react";

interface VideoWidgetProps {
    widget: CampaignWidget;
    onUpdate: (id: string, data: any) => void;
}

export function VideoWidget({ widget, onUpdate }: VideoWidgetProps) {
    const data = widget.data as { url: string };

    return (
        <div className="h-full w-full p-2 flex flex-col gap-1">
            <div className="relative group/input">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors group-focus-within/input:text-blue-500">
                    <Video size={14} />
                </div>
                <input
                    type="text"
                    value={data.url}
                    onChange={(e) => onUpdate(widget.id, { ...data, url: e.target.value })}
                    placeholder="URL VIDEO..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-none py-1.5 px-8 text-[9px] font-bold focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest"
                />
            </div>

            <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center text-slate-200">
                <Youtube size={24} strokeWidth={1} />
                <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Video Preview</p>
            </div>
        </div>
    );
}
