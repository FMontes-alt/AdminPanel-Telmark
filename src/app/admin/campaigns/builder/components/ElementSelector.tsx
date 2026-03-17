"use client"

import { Type, Video, Link2, FileText, BarChart2, Image as ImageIcon, Plus } from "lucide-react"
import { WidgetType } from "@/lib/types/campaing-builder"

interface ElementOption {
    type: WidgetType;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const ELEMENTS: ElementOption[] = [
    { type: 'text', label: 'Texto', icon: <Type size={18} />, color: 'bg-blue-500' },
    { type: 'video', label: 'Video', icon: <Video size={18} />, color: 'bg-indigo-500' },
    { type: 'link', label: 'Enlace', icon: <Link2 size={18} />, color: 'bg-emerald-500' },
    { type: 'pdf', label: 'Documento PDF', icon: <FileText size={18} />, color: 'bg-rose-500' },
    { type: 'stat', label: 'Estadística', icon: <BarChart2 size={18} />, color: 'bg-amber-500' },
    { type: 'image', label: 'Imagen', icon: <ImageIcon size={18} />, color: 'bg-violet-500' },
]

interface ElementSelectorProps {
    onAddElement: (type: WidgetType) => void;
}

export function ElementSelector({ onAddElement }: ElementSelectorProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm h-fit sticky top-24">
            <h3 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-[0.2em]">
                Elementos Disponibles
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {ELEMENTS.map((element) => (
                    <button
                        key={element.type}
                        onClick={() => onAddElement(element.type)}
                        className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group w-full text-left"
                    >
                        <div className={`${element.color} text-white p-2.5 rounded-xl shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md`}>
                            {element.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-700">{element.label}</p>
                        </div>
                        <Plus size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    )
}