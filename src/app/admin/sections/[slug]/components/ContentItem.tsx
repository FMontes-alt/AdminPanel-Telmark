"use client"

import { Download, Link as LinkIcon, FileText, Info, Trash2, Video } from "lucide-react"
import { getSignedUrlAction } from "@/actions/storage"

interface ContentItemProps {
    item: any
    onDelete: (id: string) => void
}

export default function ContentItem({ item, onDelete }: ContentItemProps) {
    const handleClick = async () => {
        if (item.externalLink) {
            let url = item.externalLink;
            
            // Si es un iframe, extraemos el src para poder abrirlo
            if (url.trim().startsWith('<iframe')) {
                const match = url.match(/src=["']([^"']+)["']/);
                if (match && match[1]) {
                    url = match[1];
                } else {
                    alert("No se pudo extraer la URL del código embed")
                    return
                }
            }

            window.open(url, '_blank')
            return
        }

        if (item.filePath) {
            try {
                const signedUrl = await getSignedUrlAction(item.filePath)
                if (signedUrl) {
                    window.open(signedUrl, '_blank')
                } else {
                    alert("No se pudo generar el enlace de visualización")
                }
            } catch (error) {
                console.error(error)
                alert("Error al intentar abrir el archivo")
            }
            return
        }
    }

    return (
        <div 
            onClick={handleClick}
            className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-blue-200 hover:shadow-md hover:shadow-slate-100 transition-all cursor-pointer group/item"
        >
            <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 group-hover/item:text-blue-600 group-hover/item:bg-blue-50 flex items-center justify-center transition-all">
                    {item.contentType === 'file' && <Download size={16} />}
                    {item.contentType === 'link' && <LinkIcon size={16} />}
                    {item.contentType === 'document' && <FileText size={16} />}
                    {item.contentType === 'video' && <Video size={16} />}
                    {item.contentType === 'info' && <Info size={16} />}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                        {item.filePath ? item.filePath.split('/').pop() : item.externalLink}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">{item.contentType}</span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-50 rounded-xl"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}

