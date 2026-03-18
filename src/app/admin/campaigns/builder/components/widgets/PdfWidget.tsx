"use client"

import { PdfWidgetData } from "@/lib/types/campaing-builder";
import { FileText, Download } from "lucide-react";

interface PdfWidgetProps {
    data: PdfWidgetData['data'];
    onChange: (newData: PdfWidgetData['data']) => void;
}

export function PdfWidget({ data, onChange }: PdfWidgetProps) {
    return (
        <div className="p-4 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-none flex items-center justify-center">
                <FileText size={24} />
            </div>
            <div className="w-full space-y-2">
                <input
                    type="text"
                    placeholder="Nombre del archivo"
                    value={data.fileName || ""}
                    onChange={(e) => onChange({ ...data, fileName: e.target.value })}
                    className="w-full text-[10px] font-bold text-center border-none focus:ring-0 outline-none placeholder:text-slate-200"
                />
                <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-100">
                    <Download size={12} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="URL del PDF"
                        value={data.fileUrl || ""}
                        onChange={(e) => onChange({ ...data, fileUrl: e.target.value })}
                        className="bg-transparent text-[9px] w-full outline-none placeholder:text-slate-300"
                    />
                </div>
            </div>
        </div>
    );
}
