"use client"

import { CampaignWidget } from "@/lib/types/campaing-builder";
import { TextWidget } from "./components/TextWidget";
import { VideoWidget } from "./components/VideoWidget";
import { LinkWidget } from "./components/LinkWidget";
import { PdfWidget } from "./components/PdfWidget";
import { StatWidget } from "./components/StatWidget";
import { ImageWidget } from "./components/ImageWidget";

interface WidgetFactoryProps {
    widget: CampaignWidget;
    onUpdate: (id: string, newData: any) => void;
}

export function WidgetFactory({ widget, onUpdate }: WidgetFactoryProps) {
    switch (widget.type) {
        case 'text':
            return <TextWidget widget={widget} onUpdate={onUpdate} />;
        case 'video':
            return <VideoWidget widget={widget} onUpdate={onUpdate} />;
        case 'link':
            return <LinkWidget widget={widget} onUpdate={onUpdate} />;
        case 'pdf':
            return <PdfWidget widget={widget} onUpdate={onUpdate} />;
        case 'stat':
            return <StatWidget widget={widget} onUpdate={onUpdate} />;
        case 'image':
            return <ImageWidget widget={widget} onUpdate={onUpdate} />;
        default:
            return (
                <div className="p-4 flex flex-col items-center justify-center h-full text-slate-400 font-bold uppercase text-[9px]">
                    Widget desconocido: {(widget as any).type}
                </div>
            );
    }
}