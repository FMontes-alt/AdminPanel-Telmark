"use client"

import { CampaignWidget } from "@/lib/types/campaign-builder";
import { Image as ImageIcon, Upload } from "lucide-react";

interface ImageWidgetProps {
    widget: CampaignWidget;
    onUpdate: (id: string, data: any) => void;
    isLocked?: boolean;
}

export function ImageWidget({ widget, onUpdate, isLocked }: ImageWidgetProps) {
    const data = widget.data as { url: string; alt: string };

    return (
        <div className={`flex flex-col gap-1 ${isLocked ? 'p-0' : 'p-2'}`}>
            <div className={`flex-1 bg-slate-50 flex flex-col items-center justify-center text-slate-200 group/upload cursor-pointer transition-all overflow-hidden relative ${isLocked ? '' : 'hover:bg-slate-100'}`}>
                {data.url ? (
                    <img src={data.url} alt={data.alt} className="w-full h-full object-cover" />
                ) : (
                    <>
                        <ImageIcon size={24} strokeWidth={1} />
                        <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Imagen</p>
                    </>
                )}
            </div>

            <div className="relative group/input">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors group-focus-within/input:text-blue-500">
                    <Upload size={12} />
                </div>
                <input
                    type="text"
                    value={data.url}
                    readOnly={isLocked}
                    onChange={(e) => onUpdate(widget.id, { ...data, url: e.target.value })}
                    placeholder="URL IMAGEN..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-none py-1 px-8 text-[8px] font-bold focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest"
                />
            </div>
        </div>
    );
}
