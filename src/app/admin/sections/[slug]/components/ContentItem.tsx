"use client"

import { Download, Link as LinkIcon, FileText, Info, Trash2, Video } from "lucide-react"

interface ContentItemProps {
    item: any
    onDelete: (id: string) => void
    onSelect: (item: any) => void
    isSelected?: boolean
}

export default function ContentItem({ item, onDelete, onSelect, isSelected }: ContentItemProps) {
    return (
        <div 
            onClick={() => onSelect(item)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group/item ${
                isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-slate-100'
            }`}
        >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex shrink-0 items-center justify-center transition-all ${
                    isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-50 text-slate-400 group-hover/item:text-blue-600 group-hover/item:bg-blue-50'
                }`}>
                    {item.contentType === 'file' && <Download size={16} />}
                    {item.contentType === 'link' && <LinkIcon size={16} />}
                    {item.contentType === 'document' && <FileText size={16} />}
                    {item.contentType === 'video' && <Video size={16} />}
                    {item.contentType === 'info' && <Info size={16} />}
                </div>
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className={`text-sm font-bold truncate block w-full ${isSelected ? 'text-white' : 'text-slate-700'}`}>{item.title}</span>
                    <span className={`text-[10px] font-medium truncate block w-full ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {item.filePath ? item.filePath.split('/').pop() : item.externalLink}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 pl-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-300'}`}>{item.contentType}</span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className={`p-2 opacity-0 group-hover/item:opacity-100 transition-all rounded-xl ${
                        isSelected
                            ? 'text-white/60 hover:text-white hover:bg-white/10'
                            : 'text-slate-300 hover:text-red-600 hover:bg-red-50'
                    }`}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}
