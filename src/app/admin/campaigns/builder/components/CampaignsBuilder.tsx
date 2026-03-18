"use client"

import React, { useState, useEffect } from "react"
import { CampaignWidget, WidgetType } from "@/lib/types/campaing-builder"

// Import modular components
import { BuilderHeader } from "./Header/BuilderHeader"
import { BuilderSidebar } from "./Sidebar/BuilderSidebar"
import { BuilderCanvas } from "./Canvas/BuilderCanvas"

export function CampaignsBuilder() {
    const [widgets, setWidgets] = useState<CampaignWidget[]>([])
    const [isSaving, setIsSaving] = useState(false)

    // Cargar datos iniciales si existen
    useEffect(() => {
        // En una implementación real, aquí cargaríamos la campaña
    }, [])

    const addWidget = (type: WidgetType) => {
        const newWidget: CampaignWidget = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: (widgets.length * 2) % 12,
            y: Infinity, // Poner al final
            w: type === 'stat' ? 3 : type === 'video' ? 6 : 4,
            h: type === 'stat' ? 3 : type === 'video' ? 6 : 4,
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
        const updatedWidgets = widgets.map(widget => {
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
        setWidgets(updatedWidgets);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simular guardado
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white overflow-hidden">
            <BuilderHeader
                widgetsCount={widgets.length}
                isSaving={isSaving}
                onSave={handleSave}
            />

            <div className="flex flex-1 overflow-hidden">
                <BuilderSidebar onAddWidget={addWidget} />

                <BuilderCanvas
                    widgets={widgets}
                    onLayoutChange={handleLayoutChange}
                    onDeleteWidget={handleDeleteWidget}
                    onUpdateWidget={handleUpdateWidget}
                />
            </div>
        </div>
    );
}
