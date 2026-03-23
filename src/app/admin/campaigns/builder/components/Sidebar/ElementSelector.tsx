"use client"

import { 
    Type, 
    Video, 
    Link, 
    FileText, 
    BarChart, 
    Image as ImageIcon,
    Plus,
    MousePointer2
} from "lucide-react";
import { WidgetType } from "@/lib/types/campaing-builder";

interface ElementSelectorProps {
    onAddElement: (type: WidgetType) => void;
}

interface ElementOption {
    type: WidgetType;
    label: string;
    icon: any;
    description: string;
    color: string;
    bgColor: string;
}

const elements: ElementOption[] = [
    { 
        type: 'text', 
        label: 'Texto', 
        icon: Type, 
        description: 'Bloque de texto',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    { 
        type: 'video', 
        label: 'Video', 
        icon: Video, 
        description: 'Vimeo, YouTube',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50'
    },
    { 
        type: 'link', 
        label: 'Enlace', 
        icon: Link, 
        description: 'Botón acción',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
    },
    { 
        type: 'pdf', 
        label: 'PDF', 
        icon: FileText, 
        description: 'Documento',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
    },
    { 
        type: 'stat', 
        label: 'Cifra', 
        icon: BarChart, 
        description: 'Dato estadístico',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
    },
    { 
        type: 'image', 
        label: 'Imagen', 
        icon: ImageIcon, 
        description: 'Foto/Galería',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
    },
];

export function ElementSelector({ onAddElement }: ElementSelectorProps) {
    return (
        <div className="bg-slate-50 border-none h-full p-0">
            <div className="p-4 border-b border-slate-200 bg-white">
                <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MousePointer2 size={12} />
                    Toolbox
                </h2>
            </div>

            <div className="divide-y divide-slate-100">
                {elements.map((element) => (
                    <button
                        key={element.type}
                        onClick={() => onAddElement(element.type)}
                        className="w-full group flex items-center gap-3 p-3 hover:bg-white transition-all text-left"
                    >
                        <div className={`w-8 h-8 ${element.bgColor} flex items-center justify-center`}>
                            <element.icon className={`w-4 h-4 ${element.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-tighter">
                                {element.label}
                            </h3>
                            <p className="text-[8px] text-slate-400 font-bold truncate uppercase">
                                {element.description}
                            </p>
                        </div>

                        <Plus size={10} className="text-slate-200 group-hover:text-blue-500" />
                    </button>
                ))}
            </div>

            <div className="p-4 mt-auto">
                <div className="p-3 bg-white border border-slate-200">
                    <p className="text-[8px] text-slate-400 font-black uppercase leading-tight">
                        Construcción directa sobre el lienzo.
                    </p>
                </div>
            </div>
        </div>
    );
}