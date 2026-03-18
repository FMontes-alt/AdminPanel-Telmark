"use client"

import { ImageWidgetData } from "@/lib/types/campaing-builder";
import { ImageIcon, Upload } from "lucide-react";

interface ImageWidgetProps {
    data: ImageWidgetData['data'];
    onChange: (newData: ImageWidgetData['data']) => void;
}

export function ImageWidget({ data, onChange }: ImageWidgetProps) {
    return (
        <div className="p-4 h-full flex flex-col justify-center gap-3">
            {!data.url ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-violet-50 text-violet-500 rounded-none flex items-center justify-center">
                        <ImageIcon size={20} />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-100 w-full">
                        <Upload size={12} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="URL de Imagen"
                            onChange={(e) => onChange({ ...data, url: e.target.value })}
                            className="bg-transparent text-[10px] w-full outline-none placeholder:text-slate-300"
                        />
                    </div>
                </div>
            ) : (
                <div className="relative group/img h-full flex flex-col">
                    <div className="flex-1 bg-slate-100 flex items-center justify-center rounded-none overflow-hidden relative">
                        <img 
                            src={data.url} 
                            alt={data.alt || "Preview"} 
                            className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all duration-500"
                        />
                        <button 
                            onClick={() => onChange({ ...data, url: '' })}
                            className="absolute inset-0 bg-blue-600/80 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center font-bold text-[10px] uppercase tracking-widest transition-opacity"
                        >
                            Cambiar Imagen
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Texto alternativo"
                        value={data.alt || ""}
                        onChange={(e) => onChange({ ...data, alt: e.target.value })}
                        className="mt-2 text-[9px] font-medium text-slate-400 border-none focus:ring-0 outline-none text-center italic"
                    />
                </div>
            )}
        </div>
    );
}
