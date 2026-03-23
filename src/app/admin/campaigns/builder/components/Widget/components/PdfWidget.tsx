"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder";
import { FileText, Download, Eye } from "lucide-react";

interface PdfWidgetProps {
    widget: CampaignWidget;
    onUpdate: (id: string, data: any) => void;
    isLocked?: boolean;
}

export function PdfWidget({ widget, onUpdate, isLocked }: PdfWidgetProps) {
    const data = widget.data as { fileUrl: string; fileName: string };

    return (
        <div className="h-full w-full p-2 flex flex-col gap-1 text-center justify-center">
            <div className="mx-auto w-8 h-8 bg-slate-900 flex items-center justify-center mb-1">
                <FileText size={16} className="text-white" strokeWidth={2} />
            </div>
            
            <div>
                <input
                    type="text"
                    value={data.fileName}
                    readOnly={isLocked}
                    onChange={(e) => onUpdate(widget.id, { ...data, fileName: e.target.value })}
                    className="w-full bg-transparent border-none focus:ring-0 text-center text-[9px] font-black text-slate-800 p-0 placeholder:text-slate-200 uppercase"
                    placeholder="ARCHIVO..."
                />
            </div>

            <div className="flex items-center justify-center gap-2 mt-1">
                <button className="text-[8px] font-black text-blue-600 uppercase tracking-widest">VER</button>
                <div className="w-[1px] h-2 bg-slate-200" />
                <button className="text-[8px] font-black text-slate-400 uppercase tracking-widest">BAJAR</button>
            </div>
        </div>
    );
}
