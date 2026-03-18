"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder";
import { TextWidget } from "./widgets/TextWidget";
import { VideoWidget } from "./widgets/VideoWidget";
import { LinkWidget } from "./widgets/LinkWidget";
import { PdfWidget } from "./widgets/PdfWidget";
import { StatWidget } from "./widgets/StatWidget";
import { ImageWidget } from "./widgets/ImageWidget";

interface WidgetFactoryProps {
    widget: CampaignWidget;
    onUpdate: (id: string, newData: any) => void;
}

export function WidgetFactory({ widget, onUpdate }: WidgetFactoryProps) {
    const handleDataChange = (newData: any) => {
        onUpdate(widget.id, newData);
    };

    switch (widget.type) {
        case 'text':
            return <TextWidget data={widget.data} onChange={handleDataChange} />;
        case 'video':
            return <VideoWidget data={widget.data} onChange={handleDataChange} />;
        case 'link':
            return <LinkWidget data={widget.data} onChange={handleDataChange} />;
        case 'pdf':
            return <PdfWidget data={widget.data} onChange={handleDataChange} />;
        case 'stat':
            return <StatWidget data={widget.data} onChange={handleDataChange} />;
        case 'image':
            return <ImageWidget data={widget.data} onChange={handleDataChange} />;
        default:
            return (
                <div className="p-4 flex flex-col items-center justify-center h-full text-slate-400 font-medium italic text-xs">
                    Widget desconocido: {(widget as any).type}
                </div>
            );
    }
}