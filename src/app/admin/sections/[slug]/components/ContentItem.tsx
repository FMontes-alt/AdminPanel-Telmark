"use client"

import { Download, Link as LinkIcon, FileText, Info, Trash2, Video } from "lucide-react"

interface ContentItemProps {
    item: any
    onDelete: (id: string) => void
    onSelect: (item: any) => void
    isSelected?: boolean
    layout?: 'list' | 'grid' | 'table'
    compact?: boolean
}

const isImage = (path?: string) => {
    if (!path) return false
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(path) || path.startsWith('data:image/')
}

export default function ContentItem({ item, onDelete, onSelect, isSelected, layout = 'list', compact = false }: ContentItemProps) {
    const itemImage = isImage(item.filePath) ? item.filePath : isImage(item.externalLink) ? item.externalLink : null

    // ─── MODO TABLA ────────────────────────────────────────────────────────
    if (layout === 'table') {
        return (
            <div
                onClick={() => onSelect(item)}
                className={`grid grid-cols-12 gap-4 px-6 py-2.5 items-center transition-all cursor-pointer border-b border-slate-50 last:border-0 hover:bg-blue-50/50 group/item ${isSelected ? 'bg-blue-50/80 border-blue-100' : 'bg-white'
                    }`}
            >
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {item.contentType === 'file' && <Download size={14} />}
                        {item.contentType === 'link' && <LinkIcon size={14} />}
                        {item.contentType === 'document' && <FileText size={14} />}
                        {item.contentType === 'video' && <Video size={14} />}
                        {item.contentType === 'info' && <Info size={14} />}
                    </div>
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{item.title}</span>
                </div>

                <div className="col-span-3 text-center">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.contentType}</span>
                </div>

                <div className="col-span-2 text-center">
                    {item.attributes?.numPoliza && (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-blue-600">#{item.attributes.numPoliza}</span>
                            {item.attributes.estado && (
                                <span className={`text-[8px] font-bold uppercase ${item.attributes.estado === 'Activa' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {item.attributes.estado}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-span-2 flex justify-end gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-1.5 opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-red-600 transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        )
    }

    // ─── MODO GRID ──────────────────────────────────────────────────────────
    if (layout === 'grid') {
        const isVideo = item.contentType === 'video' || (item.filePath && /\.(mp4|mov|webm)$/i.test(item.filePath))

        return (
            <div
                onClick={() => onSelect(item)}
                className={`flex flex-col rounded-2xl border transition-all cursor-pointer group/item overflow-hidden ${isSelected
                        ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-500/10'
                        : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50'
                    }`}
            >
                <div className={`aspect-video w-full relative flex items-center justify-center ${isSelected ? 'bg-blue-700' : 'bg-slate-50'}`}>
                    {itemImage ? (
                        <img src={itemImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" />
                    ) : isVideo ? (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'} transition-transform`}>
                            <Video size={20} fill="currentColor" />
                        </div>
                    ) : (
                        <div className={isSelected ? 'text-white/40' : 'text-slate-200'}>
                            {item.contentType === 'document' ? <FileText size={40} /> : <Info size={40} />}
                        </div>
                    )}
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className={`p-2 rounded-xl backdrop-blur-md transition-all ${isSelected ? 'bg-white/10 text-white/60 hover:text-white' : 'bg-black/5 text-slate-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <p className={`text-xs font-black uppercase tracking-tight truncate mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{item.contentType}</p>
                </div>
            </div>
        )
    }

    // ─── MODO LISTA / COMPACT ───────────────────────────────────────────────
    return (
        <div
            onClick={() => onSelect(item)}
            className={`rounded-2xl border flex items-center justify-between transition-all cursor-pointer group/item ${compact ? 'p-2.5' : 'p-3.5'
                } ${isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-slate-100'
                }`}
        >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className={`${compact ? 'w-6 h-6 rounded-lg' : 'w-8 h-8 rounded-xl'} flex shrink-0 items-center justify-center transition-all overflow-hidden ${isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-50 text-slate-400 group-hover/item:text-blue-600 group-hover/item:bg-blue-50'
                    }`}>
                    {itemImage ? (
                        <img src={itemImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            {item.contentType === 'file' && <Download size={compact ? 12 : 16} />}
                            {item.contentType === 'link' && <LinkIcon size={compact ? 12 : 16} />}
                            {item.contentType === 'document' && <FileText size={compact ? 12 : 16} />}
                            {item.contentType === 'video' && <Video size={compact ? 12 : 16} />}
                            {item.contentType === 'info' && <Info size={compact ? 12 : 16} />}
                        </>
                    )}
                </div>
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className={`${compact ? 'text-[11px]' : 'text-sm'} font-bold truncate block w-full ${isSelected ? 'text-white' : 'text-slate-700'}`}>{item.title}</span>
                    {!compact && (
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-medium truncate shrink-0 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                {item.filePath ? item.filePath.split('/').pop() : item.externalLink || 'Sin archivo'}
                            </span>
                            {/* Specialized Metadata for Policies/Data */}
                            {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <>
                                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-300' : 'bg-slate-200'}`} />
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {item.attributes.numPoliza && (
                                            <span className={`text-[9px] font-extrabold whitespace-nowrap ${isSelected ? 'text-white' : 'text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100'}`}>
                                                #{item.attributes.numPoliza}
                                            </span>
                                        )}
                                        {item.attributes.estado && (
                                            <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${isSelected
                                                    ? 'bg-white/20 text-white'
                                                    : item.attributes.estado === 'Activa' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                {item.attributes.estado}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 pl-2">
                {!compact && (
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-300'}`}>{item.contentType}</span>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className={`p-2 transition-all rounded-xl ${isSelected
                            ? 'text-white/60 hover:text-white hover:bg-white/10'
                            : `${compact ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'} text-slate-300 hover:text-red-600 hover:bg-red-50`
                        }`}
                >
                    <Trash2 size={compact ? 14 : 16} />
                </button>
            </div>
        </div>
    )
}
