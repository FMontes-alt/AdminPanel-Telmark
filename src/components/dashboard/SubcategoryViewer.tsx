"use client"

import { useState } from "react"
import {
    Link as LinkIcon,
    FileText,
    Video,
    Info,
    ChevronRight,
    X,
    ExternalLink
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getSignedUrlAction, getDownloadUrlAction } from "@/actions/storage"

interface SubcategoryViewerProps {
    sub: any
}

export function SubcategoryViewer({ sub }: SubcategoryViewerProps) {
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loadingPreview, setLoadingPreview] = useState(false)

    const getContentIcon = (contentType: string) => {
        switch (contentType) {
            case 'file': return <FileText size={20} />
            case 'link': return <LinkIcon size={20} />
            case 'document': return <FileText size={20} />
            case 'video': return <Video size={20} />
            case 'info': return <Info size={20} />
            default: return <FileText size={20} />
        }
    }

    const getSmallIcon = (contentType: string) => {
        switch (contentType) {
            case 'file': return <FileText size={16} />
            case 'link': return <LinkIcon size={16} />
            case 'document': return <FileText size={16} />
            case 'video': return <Video size={16} />
            case 'info': return <Info size={16} />
            default: return <FileText size={16} />
        }
    }

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

    const handleSelectItem = async (item: any) => {
        if (selectedItem?.id === item.id) {
            handleClose()
            return
        }

        setSelectedItem(item)
        setPreviewUrl(null)
        setLoadingPreview(true)

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
    const isVideo = (path: string) => /\.(mp4|mov|webm|avi|mkv)$/i.test(path)
    const isPdf = (path: string) => /\.pdf$/i.test(path)

    const renderPreview = () => {
        if (loadingPreview) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto shadow-sm" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Sincronizando recurso...</p>
                    </div>
                </div>
            )
        }

        if (!previewUrl || !selectedItem) return null

        const item = selectedItem

        if (item.filePath && (isVideo(item.filePath) || item.contentType === 'video')) {
            return <video src={previewUrl} controls className="w-full h-full object-contain rounded-2xl bg-black/5" />
        }

        if (item.filePath && isImage(item.filePath)) {
            return <img src={previewUrl} alt={item.title} className="w-full h-full object-contain rounded-2xl" />
        }

        if (item.filePath && isPdf(item.filePath)) {
            return <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full rounded-2xl border-0 bg-white" title={item.title} />
        }

        if (item.contentType === 'video' || item.contentType === 'link') {
            return <iframe src={previewUrl} className="w-full h-full rounded-2xl border-0 bg-black/5" title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        }

        if (item.contentType === 'info') {
            return (
                <div className="p-8 overflow-y-auto h-full max-w-3xl mx-auto">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase">{item.title}</h3>
                    <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed font-medium">
                        {item.body?.split('\n').map((line: string, i: number) => (
                            <p key={i} className="mb-4">{line}</p>
                        )) || "Sin contenido adicional."}
                    </div>
                </div>
            )
        }

        if (item.filePath) {
            return <iframe src={previewUrl} className="w-full h-full rounded-2xl border-0" title={item.title} />
        }

        return (
            <div className="flex items-center justify-center h-full text-center p-12">
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
                        <FileText size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Vista previa no disponible</h4>
                        <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto leading-relaxed">Este tipo de archivo no puede visualizarse directamente en el panel.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section className="space-y-8">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">{sub.name}</h3>
                </div>
                <div className="h-px bg-slate-200/60 flex-1" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub.items?.length || 0} Recursos</span>
            </div>

            <AnimatePresence mode="wait">
                {selectedItem ? (
                    <motion.div
                        key="viewer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="flex flex-col lg:flex-row gap-6 min-h-[600px]"
                    >
                        {/* Panel Izquierdo: Visor */}
                        <div className="flex-[3] min-w-0 bg-white border border-slate-200/60 rounded-[40px] shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col">
                            {/* Barra superior del visor */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        {getSmallIcon(selectedItem.contentType)}
                                    </div>
                                    <div className="max-w-[150px] sm:max-w-xs md:max-w-md truncate">
                                        <h4 className="text-base font-black text-slate-900 leading-tight truncate uppercase tracking-tight">{selectedItem.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tipo: {selectedItem.contentType}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Verificado</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {previewUrl && (selectedItem?.contentType === 'link' || (selectedItem?.contentType === 'video' && selectedItem?.externalLink)) && (
                                        <button
                                            onClick={handleDownload}
                                            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center group"
                                            title="Abrir enlace externo"
                                        >
                                            <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    )}
                                    <div className="w-px h-6 bg-slate-100 mx-1" />
                                    <button
                                        onClick={handleClose}
                                        className="w-10 h-10 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center group"
                                        title="Cerrar"
                                    >
                                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>
                            {/* Área de contenido */}
                            <div className="flex-1 p-4 bg-slate-50/50">
                                {renderPreview()}
                            </div>
                        </div>

                        {/* Panel Derecho: Lista de ítems */}
                        <div className="flex-[1] min-w-0 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {sub.items?.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ x: -4 }}
                                    onClick={() => handleSelectItem(item)}
                                    className={`group p-5 rounded-[32px] border cursor-pointer transition-all duration-300 ${selectedItem?.id === item.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30 ring-4 ring-blue-600/10'
                                            : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${selectedItem?.id === item.id
                                                ? 'bg-white/20 text-white scale-110'
                                                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                                            }`}>
                                            {getSmallIcon(item.contentType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-xs font-black leading-tight uppercase tracking-tight ${selectedItem?.id === item.id ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'
                                                }`}>{item.title}</h4>
                                            <p className={`text-[8px] font-bold uppercase tracking-[0.2em] mt-1.5 ${selectedItem?.id === item.id ? 'text-blue-100' : 'text-slate-400'
                                                }`}>{item.contentType}</p>
                                        </div>
                                        <ChevronRight size={16} className={`flex-shrink-0 transition-transform group-hover:translate-x-1 ${selectedItem?.id === item.id ? 'text-white/60' : 'text-slate-200 group-hover:text-blue-400'
                                            }`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* ── Layout Grid Normal ── */
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {sub.items?.map((item: any) => (
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                key={item.id}
                                onClick={() => handleSelectItem(item)}
                                className="group bg-white border border-slate-200/60 p-8 rounded-[48px] shadow-sm hover:shadow-2xl hover:shadow-blue-600/10 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-500" />
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-600/30 flex items-center justify-center">
                                            {getContentIcon(item.contentType)}
                                        </div>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                                            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                    <h4 className="text-base font-black text-slate-900 leading-[1.3] uppercase tracking-tight group-hover:text-blue-600 transition-colors duration-300">{item.title}</h4>
                                </div>

                                <div className="flex items-center gap-3 mt-8 relative z-10 pt-6 border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white" />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600/60 transition-colors">Colectivo Prime Core</span>
                                    <div className="h-px flex-1 bg-slate-100 group-hover:bg-blue-100 transition-colors" />
                                    <p className="text-[9px] font-black text-blue-600/40 uppercase tracking-[0.2em]">{item.contentType}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
