"use client"

import { StatWidgetData } from "@/lib/types/campaing-builder";
import { TrendingUp } from "lucide-react";

interface StatWidgetProps {
    data: StatWidgetData['data'];
    onChange: (newData: StatWidgetData['data']) => void;
}

export function StatWidget({ data, onChange }: StatWidgetProps) {
    return (
        <div className="p-4 h-full flex flex-col justify-center">
            <input
                type="text"
                placeholder="Título (ej: Ventas)"
                value={data.label || ""}
                onChange={(e) => onChange({ ...data, label: e.target.value })}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none focus:ring-0 outline-none placeholder:text-slate-200"
            />
            <div className="flex items-baseline gap-2">
                <input
                    type="text"
                    placeholder="Valor (ej: 1,250)"
                    value={data.value || ""}
                    onChange={(e) => onChange({ ...data, value: e.target.value })}
                    className="text-2xl font-bold text-slate-800 w-full border-none focus:ring-0 outline-none placeholder:text-slate-200"
                />
                <div className="flex items-center text-emerald-500 gap-1">
                    <TrendingUp size={12} />
                    <input
                        type="number"
                        placeholder="%"
                        value={data.trend || ""}
                        onChange={(e) => onChange({ ...data, trend: Number(e.target.value) })}
                        className="w-8 text-[10px] font-bold bg-transparent border-none focus:ring-0 outline-none placeholder:text-emerald-200"
                    />
                </div>
            </div>
        </div>
    );
}
