"use client"

import React from "react"
import { Responsive, WidthProvider } from "react-grid-layout/legacy"
import { Trash2, GripVertical, MousePointer2 } from "lucide-react"
import { CampaignWidget } from "@/lib/types/campaing-builder"
import { WidgetFactory } from "../Widget/WidgetFactory"

const ResponsiveGridLayout = WidthProvider(Responsive)

interface BuilderCanvasProps {
    widgets: CampaignWidget[];
    onLayoutChange: (layout: any) => void;
    onDeleteWidget: (id: string) => void;
    onUpdateWidget: (id: string, data: any) => void;
}

export function BuilderCanvas({
    widgets,
    onLayoutChange,
    onDeleteWidget,
    onUpdateWidget
}: BuilderCanvasProps) {
    return (
        <main className="flex-1 bg-[#f1f5f9] relative overflow-y-auto">
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <ResponsiveGridLayout
                className="layout"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={40}
                draggableHandle=".drag-handle"
                margin={[0, 0]}
                onLayoutChange={onLayoutChange}
            >
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h }}
                        className="bg-white border-r border-b border-slate-200 group transition-all flex flex-col"
                    >
                        {/* Toolbar Minimalista Recta */}
                        <div className="h-7 bg-slate-50 flex items-center justify-between px-2 border-b border-slate-100 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="drag-handle flex items-center gap-1 cursor-grab active:cursor-grabbing">
                                <GripVertical size={12} className="text-slate-300" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {widget.type}
                                </span>
                            </div>

                            <button
                                onClick={() => onDeleteWidget(widget.id)}
                                className="text-slate-300 hover:text-rose-500 transition-all p-0.5"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto bg-white p-0">
                            <WidgetFactory
                                widget={widget}
                                onUpdate={onUpdateWidget}
                            />
                        </div>
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
