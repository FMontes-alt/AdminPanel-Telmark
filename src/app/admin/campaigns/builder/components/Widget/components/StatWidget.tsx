"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatWidgetProps {
    widget: CampaignWidget;
    onUpdate: (id: string, data: any) => void;
}

export function StatWidget({ widget, onUpdate }: StatWidgetProps) {
    const data = widget.data as { label: string; value: string; trend: number };

    return (
        <div className="h-full w-full p-2 flex flex-col justify-between">
            <div className="space-y-0">
                <input
                    type="text"
                    value={data.label}
                    onChange={(e) => onUpdate(widget.id, { ...data, label: e.target.value })}
                    className="w-full bg-transparent border-none focus:ring-0 text-[8px] font-black text-slate-400 uppercase tracking-widest p-0 placeholder:text-slate-200"
                    placeholder="TITULO"
                />
                <div className="flex items-baseline gap-1">
                    <input
                        type="text"
                        value={data.value}
                        onChange={(e) => onUpdate(widget.id, { ...data, value: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 text-xl font-black text-slate-900 p-0 w-16 placeholder:text-slate-100 uppercase"
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="flex items-center gap-1 pt-1 border-t border-slate-50">
                <div className={`flex items-center gap-0.5 px-1 py-0.5 text-[8px] font-black ${
                    data.trend > 0 ? 'text-emerald-600' : 
                    data.trend < 0 ? 'text-rose-600' : 
                    'text-slate-400'
                }`}>
                    {data.trend > 0 ? <TrendingUp size={10} /> : data.trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                    {Math.abs(data.trend)}%
                </div>
            </div>
        </div>
    );
}
