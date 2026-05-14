"use client"

import { X, Download, ExternalLink, ChevronLeft, ChevronRight, Maximize2, Minimize2, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface ItemPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    item: any
    previewUrl: string | null
    onNext?: () => void
    onPrev?: () => void
    hasPrev?: boolean
    hasNext?: boolean
    onDownload?: () => void
}

export default function ItemPreviewModal({ 
    isOpen, 
    onClose, 
    item, 
    previewUrl, 
    onNext, 
    onPrev, 
    hasNext, 
    hasPrev,
    onDownload 
}: ItemPreviewModalProps) {
    const [isMaximized, setIsMaximized] = useState(false)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen || !item) return null

    const isImage = (path: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(path)
    const isVideoFile = (path: string) => /\.(mp4|mov|webm|avi|mkv)$/i.test(path)
    const isPdf = (path: string) => /\.pdf$/i.test(path)

    const renderContent = () => {
        if (!previewUrl) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest">Preparando vista previa...</p>
                </div>
            )
        }

        if (item.filePath && (isVideoFile(item.filePath) || item.contentType === 'video')) {
            return <video src={previewUrl} controls className="w-full h-full object-contain" autoPlay />
        }
        if (item.filePath && isImage(item.filePath)) {
            return <img src={previewUrl} alt={item.title} className="w-full h-full object-contain" />
        }
        if (item.filePath && isPdf(item.filePath)) {
            return <iframe src={`${previewUrl}#toolbar=1`} className="w-full h-full border-0" title={item.title} />
        }
        if (item.contentType === 'video' || item.contentType === 'link') {
            return <iframe src={previewUrl} className="w-full h-full border-0" title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        }
        if (item.contentType === 'info') {
            return (
                <div className="p-12 overflow-y-auto h-full max-w-4xl mx-auto bg-white">
                    <h2 className="text-3xl font-black text-slate-900 mb-8 border-b pb-6">{item.title}</h2>
                    <div className="prose prose-blue max-w-none text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                        {item.body || "Sin contenido adicional."}
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                <div className="p-6 bg-slate-50 rounded-full text-slate-300">
                    <Download size={48} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">Vista previa no disponible</h3>
                    <p className="text-sm text-slate-500">Este tipo de archivo no puede visualizarse directamente en el navegador.</p>
                </div>
                <button 
                    onClick={onDownload}
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
                >
                    <Download size={18} />
                    Descargar Archivo
                </button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative bg-white w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ${
                    isMaximized ? 'h-full rounded-none' : 'h-[90vh] max-w-7xl rounded-[32px]'
                }`}
            >
                {/* Header */}
                <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl hidden sm:block">
                            <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">{item.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.contentType}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {onDownload && (
                            <button 
                                onClick={onDownload}
                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Descargar"
                            >
                                <Download size={20} />
                            </button>
                        )}
                        <button 
                            onClick={() => setIsMaximized(!isMaximized)}
                            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all hidden sm:block"
                            title={isMaximized ? "Contraer" : "Maximizar"}
                        >
                            {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <div className="w-px h-6 bg-slate-100 mx-1 hidden sm:block" />
                        <button 
                            onClick={onClose}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative bg-slate-50 overflow-hidden">
                    {renderContent()}

                    {/* Navigation Arrows */}
                    <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none">
                        {hasPrev && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                                className="w-12 h-12 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-all pointer-events-auto active:scale-90"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        {hasNext && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                                className="w-12 h-12 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-all pointer-events-auto active:scale-90"
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Info (Mobile only or extra details) */}
                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0 sm:hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[70%]">
                        {item.filePath?.split('/').pop() || item.externalLink}
                    </p>
                    {onDownload && (
                        <button onClick={onDownload} className="text-[10px] font-black text-blue-600 uppercase">Descargar</button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
