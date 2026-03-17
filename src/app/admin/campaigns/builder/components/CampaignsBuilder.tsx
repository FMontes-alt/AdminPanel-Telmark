"use client"

import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import { CampaignWidget, WidgetType } from "@/lib/types/campaing-builder";
import { ElementSelector } from "./ElementSelector";
import { WidgetFactory } from "./WidgetFactory";
import { Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function CampaignsBuilder() {
    const [widgets, setWidgets] = useState<CampaignWidget[]>([]);

    const addWidget = (type: WidgetType) => {
        const newWidget: any = {
            id: `widget-${Date.now()}`,
            type: type,
            x: (widgets.length * 2) % 12,
            y: Infinity,
            w: 4,
            h: 2,
            data: {}
        };
        setWidgets([...widgets, newWidget]);
    };

    const handleSave = () => {
        console.log("Guardando en base de datos...", widgets);
        // TODO: Integración con Supabase para guardar el JSON del layout
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Contenedor Principal del Builder */}
            <div className="flex-1 w-full bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative group">
                {/* Efecto de fondo sutil inspirado en el Admin */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-50/30 rounded-full blur-3xl group-hover:bg-blue-100/30 transition-colors duration-700" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Constructor de Campaña</h2>
                        <p className="text-slate-500 text-sm mt-1">Arrastra y organiza los elementos de tu dashboard.</p>
                    </div>

                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 py-6 rounded-2xl shadow-lg shadow-blue-500/10 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Save size={18} />
                        Guardar Plantilla
                    </Button>
                </div>

                {/* Área de Diseño de la Cuadrícula */}
                <div className="relative z-10">
                    <ResponsiveGridLayout
                        className="layout min-h-[600px] bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={100}
                        draggableHandle=".drag-handle"
                        margin={[20, 20]}
                    >
                        {widgets.map((widget) => (
                            <div
                                key={widget.id}
                                data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h }}
                                className="bg-white border border-slate-200 rounded-[1.8rem] shadow-sm group hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all overflow-hidden"
                            >
                                {/* Tirador de Arrastre Estilizado */}
                                <div className="drag-handle h-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-center cursor-move group-hover:bg-blue-50/50 transition-colors">
                                    <div className="w-10 h-1 bg-slate-200 rounded-full group-hover:bg-blue-300 transition-colors" />
                                </div>
                                
                                <WidgetFactory widget={widget} />
                            </div>
                        ))}
                    </ResponsiveGridLayout>

                    {widgets.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                            <Plus size={48} className="mb-4 opacity-10" />
                            <p className="font-bold text-sm tracking-widest uppercase opacity-40">Área de Diseño Vacía</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selector Lateral */}
            <aside className="w-full lg:w-[320px]">
                <ElementSelector onAddElement={addWidget} />
            </aside>
        </div>
    );
}
