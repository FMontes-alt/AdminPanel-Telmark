"use client"

import { TextWidgetData } from "@/lib/types/campaing-builder";

interface TextWidgetProps {
    data: TextWidgetData['data'];
    onChange: (newData: TextWidgetData['data']) => void;
}

export function TextWidget({ data, onChange }: TextWidgetProps) {
    return (
        <div className="p-4 h-full flex flex-col">
            <textarea
                value={data.content || ""}
                onChange={(e) => onChange({ ...data, content: e.target.value })}
                placeholder="Escribe tu texto aquí..."
                className="w-full h-full p-2 bg-transparent border-none focus:ring-0 resize-none text-slate-700 text-sm font-medium placeholder:text-slate-300"
            />
        </div>
    );
}
