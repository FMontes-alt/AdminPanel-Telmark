"use client"

import React, { useState, useEffect } from "react"
import { CampaignWidget, WidgetType } from "@/lib/types/campaing-builder"
import AlertModal from "@/components/ui/AlertModal"

// Import modular components
import { BuilderHeader } from "./Header/BuilderHeader"
import { BuilderSidebar } from "./Sidebar/BuilderSidebar"
import { BuilderCanvas } from "./Canvas/BuilderCanvas"

export function CampaignsBuilder() {
    const [widgets, setWidgets] = useState<CampaignWidget[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [showAlphaAlert, setShowAlphaAlert] = useState(true)

    // Cargar datos iniciales si existen
    useEffect(() => {
        // En una implementación real, aquí cargaríamos la campaña
    }, [])

    const addWidget = (type: WidgetType) => {
        const newWidget: CampaignWidget = {
            id: Math.random().toString(36).slice(2, 11),
            type,
            x: (widgets.length * 4) % 24,
            y: Infinity,
            w: type === 'stat' ? 6 : type === 'video' ? 12 : 8,
            h: type === 'stat' ? 6 : type === 'video' ? 12 : 8,
            data: getDefaultData(type)
        };
        setWidgets([...widgets, newWidget]);
    };

    const getDefaultData = (type: WidgetType) => {
        switch (type) {
            case 'text': return { content: '' };
            case 'video': return { url: '' };
            case 'link': return { url: '', label: 'Botón' };
            case 'pdf': return { fileUrl: '', fileName: 'documento.pdf' };
            case 'stat': return { label: 'Visitantes', value: '1,234', trend: 12 };
            case 'image': return { url: '', alt: 'Imagen de campaña' };
            default: return {} as any;
        }
    };

    const handleDeleteWidget = (id: string) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    const handleUpdateWidget = (id: string, data: any) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, data } : w));
    };

    const handleLayoutChange = (currentLayout: any) => {
        setWidgets(prevWidgets => {
            const updatedWidgets = prevWidgets.map(widget => {
                // Si el widget está bloqueado, preservamos su estado (incluyendo el h calculado)
                // de lo contrario, el Grid Layout podría intentar resetearlo al tamaño anterior
                if (widget.isLocked) return widget;

                const layoutItem = currentLayout.find((item: any) => item.i === widget.id);
                if (layoutItem) {
                    return {
                        ...widget,
                        x: layoutItem.x,
                        y: layoutItem.y,
                        w: layoutItem.w,
                        h: layoutItem.h
                    };
                }
                return widget;
            });
            return updatedWidgets;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // TODO hacer el guardado 
        setTimeout(() => setIsSaving(false), 1000);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        console.log("Publcado campaña para los trabajadores...", widgets)
        // TODO meter la logica de Supabase
        setTimeout(() => {
            setIsPublishing(false);
            alert("Campaña publicada con exito");
        }, 1500)
    }

    const handleToggleLock = (id: string) => {
        const widget = widgets.find(w => w.id === id);
        if (!widget) return;
        
        const isLocking = !widget.isLocked;
        let finalH = widget.h;

        if (isLocking) {
            const contentWrapper = document.getElementById(`widget-content-${id}`);
            const actualWidget = contentWrapper?.firstElementChild as HTMLElement;

            if (actualWidget) {
                // TRUCO AVANZADO: Lo sacamos del flujo para medir su altura natural sin interferencias
                const originalStyle = actualWidget.getAttribute('style') || "";
                actualWidget.style.height = 'auto';
                actualWidget.style.position = 'absolute';
                actualWidget.style.visibility = 'hidden';
                actualWidget.style.zIndex = '-999';
                
                // Medimos la altura natural pura del contenido SIN los paddings del widget
                const realHeight = actualWidget.scrollHeight || actualWidget.offsetHeight;
                
                // Restauramos inmediatamente
                actualWidget.setAttribute('style', originalStyle);

                // Cálculo exacto del bloque bloqueado:
                // - pt-8 (32px): padding-top que compensa la cabecera absolute (h-8 = 32px)
                // - realHeight: contenido medido
                // - pb-8 (32px): padding inferior
                // - border-2: 4px (2px arriba + 2px abajo)
                // Total píxeles = 32 + realHeight + 32 + 4 = realHeight + 68
                //
                // Fórmula del grid (react-grid-layout):
                //   pixelHeight = rowHeight * h + margin * (h - 1) = 20h + 8(h-1) = 28h - 8
                //   Despejando: h = (pixelHeight + 8) / 28
                const totalPx = realHeight + 68;
                finalH = Math.ceil((totalPx + 8) / 28);
                
                console.log('Diagnóstico de ajuste:', { realHeight, totalPx, finalH, gridPx: 28 * finalH - 8 });
            }
        }

        setWidgets(widgets.map(w => 
            w.id === id ? { ...w, isLocked: isLocking, h: finalH } : w
        ));
    };

    return (
        <div className="flex flex-col min-h-screen bg-white overflow-hidden">
            <AlertModal
                isOpen={showAlphaAlert}
                onClose={() => setShowAlphaAlert(false)}
                title="Funcionalidad en Fase Alpha"
                message="La sección de construcción de campañas se encuentra en una fase temprana de desarrollo (Alpha). Actualmente no es completamente funcional y los cambios que realices no tendrán efecto ni se guardarán en el sistema."
                type="warning"
            />
            <BuilderHeader
                widgetsCount={widgets.length}
                isSaving={isSaving}
                isPublishing={isPublishing}
                onSave={handleSave}
                onPublish={handlePublish}
            />

            <div className="flex flex-1 overflow-hidden">
                <BuilderSidebar onAddWidget={addWidget} />

                <BuilderCanvas
                    widgets={widgets}
                    onLayoutChange={handleLayoutChange}
                    onDeleteWidget={handleDeleteWidget}
                    onUpdateWidget={handleUpdateWidget}
                    onAdjustWidget={handleToggleLock}
                />
            </div>
        </div>
    );
}
