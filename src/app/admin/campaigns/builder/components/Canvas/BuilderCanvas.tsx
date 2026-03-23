"use client"

import React from "react"
import { Responsive, WidthProvider } from "react-grid-layout/legacy"
import { Trash2, GripVertical, MousePointer2 } from "lucide-react"
import { CampaignWidget, WidgetType } from "@/lib/types/campaing-builder"
import { WidgetFactory } from "../Widget/WidgetFactory"
import { CanvasItem } from "./CanvasItem"


const ResponsiveGridLayout = WidthProvider(Responsive)

interface BuilderCanvasProps {
    widgets: CampaignWidget[];
    onLayoutChange: (layout: any) => void;
    onDeleteWidget: (id: string) => void;
    onUpdateWidget: (id: string, data: any) => void;
    onAdjustWidget: (id: string) => void; 
}

export function BuilderCanvas({
    widgets,
    onLayoutChange,
    onDeleteWidget,
    onUpdateWidget,
    onAdjustWidget
    
}: BuilderCanvasProps) {
    return (
        <main className="flex-1 bg-[#f1f5f9] relative overflow-y-auto">
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <ResponsiveGridLayout
                key={`grid-${widgets.map(w => `${w.id}-${w.isLocked}-${w.h}`).join('-')}`}
                className="layout"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 24, md: 24, sm: 12, xs: 8, xxs: 4 }}
                rowHeight={20}
                draggableHandle=".drag-handle"
                margin={[8, 8]}
                onLayoutChange={onLayoutChange}
                layouts={{
                    lg: widgets.map(w => ({
                        i: w.id,
                        x: w.x,
                        y: w.y,
                        w: w.w,
                        h: w.h,
                        static: w.isLocked
                    }))
                }}
            >
                {widgets.map((widget) => (
                    <div key={widget.id}>
                        <CanvasItem
                            widget={widget}
                            onDelete={onDeleteWidget}
                            onUpdate={onUpdateWidget}
                            onAdjust= {onAdjustWidget}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>

            {widgets.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center p-12 border-4 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-slate-100 flex items-center justify-center mx-auto mb-6">
                            <MousePointer2 size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Lienzo Vacío</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto uppercase font-bold tracking-widest leading-relaxed">
                            Selecciona un elemento de la izquierda para comenzar.
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
