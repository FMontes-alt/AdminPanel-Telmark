"use client"

import { useState } from "react"
import { FilePlus, Trash2, Download, X, FileText, Link as LinkIcon, Info, Video, Table as TableIcon, LayoutGrid, List, ExternalLink, Lock, Maximize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toSlug } from "@/lib/utils"
import ItemForm from "./ItemForm"
import ContentItem from "./ContentItem"
import { getSignedUrlAction, getDownloadUrlAction } from "@/actions/storage"
import { SECTION_TEMPLATES, SectionTemplateType } from "@/lib/constants/section-templates"
import ItemPreviewModal from "./ItemPreviewModal"

interface SubcategoryCardProps {
    sub: any
    isAddingItem: boolean
    onStartAddingItem: () => void
    onCancelAddingItem: () => void
    onAddItem: (data: any) => Promise<void>
    onDeleteSub: () => void
    onDeleteItem: (id: string) => void
    sectionSlug: string
    categorySlug: string
    sectionTemplate: string
    isLocked?: boolean
}

export default function SubcategoryCard({ 
    sub, 
    isAddingItem, 
    onStartAddingItem, 
    onCancelAddingItem, 
    onAddItem,
    onDeleteSub,
    onDeleteItem,
    sectionSlug,
    categorySlug,
    sectionTemplate,
    isLocked = false
}: SubcategoryCardProps) {
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const template = SECTION_TEMPLATES[sectionTemplate as SectionTemplateType] || SECTION_TEMPLATES.GENERICO
    const layout = template.layout

    const getEmbedUrl = (url: string) => {
        if (!url) return url;
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }
        const vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/i);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
        return url;
    }

    const getWatchUrl = (url: string) => {
        if (!url) return url;
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
        }
        const vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/i);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://vimeo.com/${vimeoMatch[1]}`;
        }
        return url;
    }

    const handleSelectItem = async (item: any, openModal: boolean = false) => {
        if (selectedItem?.id === item.id) {
            if (openModal) setShowModal(true)
            return
        }

        setSelectedItem(item)
        setPreviewUrl(null)
        setLoadingPreview(true)
        if (openModal) setShowModal(true)

        try {
            if (item.filePath) {
                const url = await getSignedUrlAction(item.filePath)
                if (url && (item.filePath.toLowerCase().endsWith('.pdf') || item.contentType === 'document')) {
                    try {
                        const response = await fetch(url)
                        const blob = await response.blob()
                        const objectUrl = URL.createObjectURL(blob)
                        setPreviewUrl(objectUrl)
                    } catch (e) {
                        setPreviewUrl(url)
                    }
                } else {
                    setPreviewUrl(url)
                }
            } else if (item.externalLink) {
                let url = item.externalLink
                if (url.trim().startsWith('<iframe')) {
                    const match = url.match(/src=["']([^"']+)["']/)
                    if (match && match[1]) url = match[1]
                }
                setPreviewUrl(getEmbedUrl(url))
            }
        } catch (error) {
            console.error("Error loading preview:", error)
        } finally {
            setLoadingPreview(false)
        }
    }

    const handleClose = () => {
        setSelectedItem(null)
        setPreviewUrl(null)
    }

    const handleDownload = async () => {
        if (!selectedItem) return

        const isExternal = selectedItem.contentType === 'link' || (selectedItem.contentType === 'video' && selectedItem.externalLink)

        if (isExternal) {
            let url = selectedItem.externalLink
            if (url?.trim().startsWith('<iframe')) {
                const match = url.match(/src=["']([^"']+)["']/)
                if (match && match[1]) url = match[1]
            }
            if (url) window.open(getWatchUrl(url) || url, '_blank')
            return
        }

        if (selectedItem.filePath) {
            try {
                const downloadUrl = await getDownloadUrlAction(selectedItem.filePath)
                if (downloadUrl) {
                    const a = document.createElement('a')
                    a.href = downloadUrl
                    a.download = selectedItem.title || 'download'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                }
            } catch (error) {
                console.error("Error al forzar la descarga:", error)
            }
        }
    }

    const isImage = (path: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(path)
    const isVideoFile = (path: string) => /\.(mp4|mov|webm|avi|mkv)$/i.test(path)
    const isPdf = (path: string) => /\.pdf$/i.test(path)

    const getSmallIcon = (contentType: string) => {
        switch (contentType) {
            case 'file': return <Download size={14} />
            case 'link': return <LinkIcon size={14} />
            case 'document': return <FileText size={14} />
            case 'video': return <Video size={14} />
            case 'info': return <Info size={14} />
            default: return <FileText size={14} />
        }
    }

    const renderPreview = () => {
        if (loadingPreview) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cargando...</p>
                    </div>
                </div>
            )
        }

        if (!previewUrl || !selectedItem) return null
        const item = selectedItem

        if (item.filePath && (isVideoFile(item.filePath) || item.contentType === 'video')) {
            return <video src={previewUrl} controls className="w-full h-full object-contain rounded-xl" />
        }
        if (item.filePath && isImage(item.filePath)) {
            return <img src={previewUrl} alt={item.title} className="w-full h-full object-contain rounded-xl" />
        }
        if (item.filePath && isPdf(item.filePath)) {
            return <iframe src={previewUrl} className="w-full h-full rounded-xl border-0" title={item.title} />
        }
        if (item.contentType === 'video' || item.contentType === 'link') {
            return <iframe src={previewUrl} className="w-full h-full rounded-xl border-0" title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        }
        if (item.contentType === 'info') {
            return (
                <div className="p-4 overflow-y-auto h-full">
                    <h3 className="text-base font-black text-slate-900 mb-3">{item.title}</h3>
                    <div className="prose prose-sm text-slate-600">{item.body || "Sin contenido adicional."}</div>
                </div>
            )
        }
        if (item.filePath) {
            return <iframe src={previewUrl} className="w-full h-full rounded-xl border-0" title={item.title} />
        }

        return (
            <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                    <Download size={24} className="mx-auto text-slate-300" />
                    <p className="text-xs text-slate-500 font-bold">Vista previa no disponible</p>
                    <button onClick={handleDownload} className="text-[10px] text-blue-600 font-bold uppercase underline">Descargar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-50/40 rounded-[28px] p-6 border border-slate-100/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group/sub">
            <div className="flex items-center justify-between mb-5">
                <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    {sub.name}
                    <span className="ml-2 px-2 py-0.5 bg-slate-100 text-[8px] text-slate-400 rounded-md uppercase tracking-widest font-bold border border-slate-200/50">
                        {layout === 'grid' ? <LayoutGrid size={10} className="inline mr-1" /> : layout === 'table' ? <TableIcon size={10} className="inline mr-1" /> : <List size={10} className="inline mr-1" />}
                        Vista {layout}
                    </span>
                </h4>
                <div className="flex items-center gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                    <button 
                        onClick={onStartAddingItem}
                        disabled={isLocked}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-tight flex items-center gap-1.5 shadow-sm border transition-colors ${
                            isLocked 
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-white border-slate-100 text-blue-600 hover:bg-blue-50"
                        }`}
                    >
                        {isLocked ? <Lock size={14} /> : <FilePlus size={14} />}
                        Añadir Item
                    </button>
                    <button 
                        onClick={onDeleteSub}
                        disabled={isLocked}
                        className={`p-2 rounded-xl border shadow-sm transition-colors ${
                            isLocked
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                : "text-slate-500 border-slate-200 bg-white hover:text-red-600 hover:bg-red-50"
                        }`}
                    >
                        {isLocked ? <Lock size={16} /> : <Trash2 size={16} />}
                    </button>
                </div>
            </div>

            {isAddingItem && (
                <ItemForm 
                    onSubmit={onAddItem}
                    onCancel={onCancelAddingItem}
                    sectionSlug={sectionSlug}
                    categorySlug={categorySlug}
                    subcategorySlug={sub.slug || toSlug(sub.name)}
                    sectionTemplate={sectionTemplate}
                />
            )}

            <AnimatePresence mode="wait">
                {selectedItem ? (
                    /* ── Layout Master-Detail ── */
                    <motion.div
                        key="viewer"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Panel Superior: Visor */}
                        <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[600px] lg:min-h-[700px]">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-lg bg-blue-600 text-white">
                                        {getSmallIcon(selectedItem.contentType)}
                                    </div>
                                    <div className="max-w-[150px] sm:max-w-xs md:max-w-sm truncate">
                                        <h4 className="text-xs font-black text-slate-800 leading-tight truncate">{selectedItem.title}</h4>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{selectedItem.contentType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {previewUrl && (
                                        <button 
                                            onClick={handleDownload} 
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" 
                                            title={selectedItem?.contentType === 'link' || (selectedItem?.contentType === 'video' && selectedItem?.externalLink) ? "Abrir enlace externo" : "Descargar"}
                                        >
                                            {selectedItem?.contentType === 'link' || (selectedItem?.contentType === 'video' && selectedItem?.externalLink) ? (
                                                <ExternalLink size={16} />
                                            ) : (
                                                <Download size={16} />
                                            )}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowModal(true)} 
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" 
                                        title="Ver en grande"
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-slate-200 mx-1" />
                                    <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all" title="Cerrar">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 p-1.5 bg-slate-50">
                                {renderPreview()}
                            </div>
                        </div>

                        {/* Panel Inferior: Lista de ítems (Grid horizontal para ahorrar espacio) */}
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {sub.items?.map((item: any) => (
                                <ContentItem
                                    key={item.id}
                                    item={item}
                                    isLocked={isLocked}
                                    onDelete={onDeleteItem}
                                    onSelect={(item) => handleSelectItem(item, false)}
                                    isSelected={selectedItem?.id === item.id}
                                    compact={true}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* ── Layout Normal ── */
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={
                            layout === 'grid' 
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                                : layout === 'table'
                                    ? "space-y-1 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
                                    : "space-y-2.5"
                        }
                    >
                        {layout === 'table' && sub.items?.length > 0 && (
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="col-span-5">Título / Información</div>
                                <div className="col-span-3 text-center">Tipo</div>
                                <div className="col-span-2 text-center text-blue-500">Póliza / Estado</div>
                                <div className="col-span-2 text-right">Acciones</div>
                            </div>
                        )}

                        {sub.items?.length > 0 ? (
                            sub.items.map((item: any) => (
                                <ContentItem 
                                    key={item.id} 
                                    item={item} 
                                    isLocked={isLocked}
                                    onDelete={onDeleteItem}
                                    onSelect={(item) => handleSelectItem(item, false)}
                                    layout={layout}
                                />
                            ))
                        ) : (
                            <div className={`py-8 text-center border-2 border-dashed border-slate-50 rounded-[24px] bg-white/50 ${layout === 'grid' ? 'col-span-full' : ''}`}>
                                <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-widest">Sin contenidos</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ItemPreviewModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                item={selectedItem}
                previewUrl={previewUrl}
                onDownload={handleDownload}
                hasNext={sub.items && sub.items.findIndex((i: any) => i.id === selectedItem?.id) < sub.items.length - 1}
                hasPrev={sub.items && sub.items.findIndex((i: any) => i.id === selectedItem?.id) > 0}
                onNext={() => {
                    const idx = sub.items.findIndex((i: any) => i.id === selectedItem?.id)
                    if (idx < sub.items.length - 1) handleSelectItem(sub.items[idx + 1])
                }}
                onPrev={() => {
                    const idx = sub.items.findIndex((i: any) => i.id === selectedItem?.id)
                    if (idx > 0) handleSelectItem(sub.items[idx - 1])
                }}
            />
        </div>
    )
}
