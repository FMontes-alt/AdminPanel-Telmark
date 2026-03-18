"use client"

import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import { CampaignWidget, WidgetType } from "@/lib/types/campaing-builder";
import { ElementSelector } from "./ElementSelector";
import { WidgetFactory } from "./WidgetFactory";
import { Save, Layout, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function CampaignsBuilder() {
    const [widgets, setWidgets] = useState<CampaignWidget[]>([]);

    const addWidget = (type: WidgetType) => {
        const id = `widget-${Date.now()}`;
        let newWidget: CampaignWidget;

        // Inicializar con datos por defecto según el tipo
        const base = {
            id,
            x: (widgets.length * 2) % 12,
            y: Infinity,
            w: 4,
            h: 2,
        };

        switch (type) {
            case 'text':
                newWidget = { ...base, type: 'text', data: { content: '' } };
                break;
            case 'video':
                newWidget = { ...base, type: 'video', data: { url: '' } };
                break;
            case 'link':
                newWidget = { ...base, type: 'link', data: { url: '', label: 'Nuevo Enlace' } };
                break;
            case 'pdf':
                newWidget = { ...base, type: 'pdf', data: { fileUrl: '', fileName: 'Documento.pdf' } };
                break;
            case 'stat':
                newWidget = { ...base, type: 'stat', data: { label: 'Estadística', value: '0', trend: 0 } };
                break;
            case 'image':
                newWidget = { ...base, type: 'image', data: { url: '', alt: '' } };
                break;
            default:
                return;
        }

        setWidgets([...widgets, newWidget]);
    };

    const handleUpdateWidget = (id: string, newData: any) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, data: newData } : w));
    };

    const handleDeleteWidget = (id: string) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    const handleLayoutChange = (currentLayout: any) => {
        // Actualizar posiciones en el estado local si es necesario
        const updatedWidgets = widgets.map(w => {
            const layoutItem = currentLayout.find((l: any) => l.i === w.id);
            if (layoutItem) {
                return {
                    ...w,
                    x: layoutItem.x,
                    y: layoutItem.y,
                    w: layoutItem.w,
                    h: layoutItem.h
                };
            }
            return w;
        });
        // we don't setWidgets here to avoid infinite loops if not careful, 
        // but typically react-grid-layout manages its own internal state for dragging
    };

    const handleSave = () => {
        console.log("Guardando en base de datos...", widgets);
        // Aquí conectaremos con Supabase
    };

    return (
        <div className="space-y-4 pb-10 max-w-[1600px] mx-auto px-4">
            {/* Cabecera Estilo Admin/Login */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-none border border-slate-200 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight">
                        Constructor de <span className="font-bold bg-gradient-to-tr from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">Campaña</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                            DISEÑO DE DASHBOARD
                        </p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <p className="text-blue-600 text-[10px] font-bold tracking-[0.1em] uppercase">
                            {widgets.length} Elementos
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-3">
                    <Button
                        variant="outline"
                        className="rounded-none px-6 py-6 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border-2"
                    >
                        <Settings2 size={16} className="mr-2" />
                        Plantillas
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 hover:scale-[1.02] active:scale-[0.98] text-white rounded-none px-8 py-6 shadow-xl shadow-blue-500/20 transition-all font-bold text-xs uppercase tracking-widest gap-2"
                    >
                        <Save size={18} />
                        Guardar Proyecto
                    </Button>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Columna Izquierda: Selector de Elementos */}
                <div className="lg:col-span-2">
                    <ElementSelector onAddElement={addWidget} />
                </div>

                {/* Lienzo del Constructor (Cuerpo Principal) */}
                <div className="lg:col-span-10">
                    <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-none p-0 min-h-[80vh] relative overflow-hidden">
                        {/* Grid Background pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                             style={{backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px'}} />

                        <ResponsiveGridLayout
                            className="layout"
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                            rowHeight={80}
                            draggableHandle=".drag-handle"
                            margin={[12, 12]}
                            onLayoutChange={handleLayoutChange}
                        >
                            {widgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h }}
                                    className="bg-white border border-slate-200 rounded-none shadow-sm group hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    {/* Barra de herramientas del widget */}
                                    <div className="h-8 bg-slate-50/80 flex items-center justify-between px-3 border-b border-slate-100">
                                        <div className="drag-handle flex gap-1 cursor-move p-2 -ml-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-1 h-1 bg-slate-300 rounded-full group-hover:bg-blue-400 transition-colors" />
                                            ))}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                {widget.type}
                                            </span>
                                            <button 
                                                onClick={() => handleDeleteWidget(widget.id)}
                                                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-auto">
                                        <WidgetFactory 
                                            widget={widget} 
                                            onUpdate={handleUpdateWidget} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </ResponsiveGridLayout>

                        {widgets.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 opacity-60 select-none">
                                <div className="w-16 h-16 border-2 border-slate-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <Layout size={32} strokeWidth={1.5} />
                                </div>
                                <p className="font-bold text-[10px] tracking-[0.3em] uppercase">Arrastra o pulsa elementos para comenzar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

