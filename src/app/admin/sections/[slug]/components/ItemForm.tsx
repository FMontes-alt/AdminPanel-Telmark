"use client"

import { ArrowLeft, Upload, Link, Type, Video, X } from "lucide-react"
import { useState, useRef } from "react"
import { uploadFileAction } from "@/actions/storage"

interface ItemFormProps {
    sectionSlug: string
    categorySlug: string
    onSubmit: (data: { 
        title: string, 
        contentType: "info" | "document" | "file" | "link" | "video", 
        body?: string,
        filePath?: string,
        externalLink?: string,
        attributes?: any
    }) => Promise<void>
    onCancel: () => void
}

export default function ItemForm({ sectionSlug, categorySlug, onSubmit, onCancel }: ItemFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        title: "",
        contentType: "info" as "info" | "document" | "file" | "link" | "video",
        body: "",
        externalLink: "",
        filePath: "",
        videoSource: "url" as "file" | "url" | "embed",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                alert("El archivo es demasiado pesado (máximo 50MB)")
                return
            }
            setSelectedFile(file)
        }
    }

    const handleSubmit = async () => {
        if (!formData.title || isSubmitting) return
        setIsSubmitting(true)
        
        let finalFilePath = formData.filePath

        try {
            // 1. Si hay un archivo seleccionado, subirlo primero
            if (selectedFile && (formData.contentType === 'file' || formData.contentType === 'document' || (formData.contentType === 'video' && formData.videoSource === 'file'))) {
                setUploadProgress(10) // Progreso simulado inicial
                const uploadData = new FormData()
                uploadData.append('file', selectedFile)
                
                const result = await uploadFileAction(uploadData, sectionSlug, categorySlug)
                finalFilePath = result.fullPath
                setUploadProgress(100)
            }

            // 2. Enviar el formulario final
            await onSubmit({
                ...formData,
                filePath: finalFilePath,
                attributes: formData.contentType === 'video' ? { videoSource: formData.videoSource } : {}
            })
            
            setFormData({ title: "", contentType: "info", body: "", externalLink: "", filePath: "", videoSource: "url" })
            setSelectedFile(null)
            setUploadProgress(null)
        } catch (error) {
            console.error(error)
            alert("Error al guardar: " + (error as any).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-blue-100 mb-5 space-y-6 shadow-xl shadow-blue-500/5 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        {formData.contentType === 'info' && <Type size={18} />}
                        {formData.contentType === 'link' && <Link size={18} />}
                        {formData.contentType === 'video' && <Video size={18} />}
                        {(formData.contentType === 'file' || formData.contentType === 'document') && <Upload size={18} />}
                    </div>
                    <h5 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Crear Nuevo Contenido</h5>
                </div>
                <button onClick={onCancel} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <ArrowLeft size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Título */}
                <input 
                    autoFocus
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Título del ítem..."
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 px-5 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                />

                {/* Tipo de Contenido Selector */}
                <div className="grid grid-cols-5 gap-2 p-1 bg-slate-50 rounded-2xl">
                    {(['info', 'document', 'file', 'link', 'video'] as const).map(type => (
                        <button 
                            key={type}
                            type="button"
                            onClick={() => setFormData({...formData, contentType: type})}
                            className={`py-2 rounded-xl text-[10px] font-bold transition-all ${formData.contentType === type ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {type.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Campos Condicionales según Tipo */}
                {formData.contentType === 'video' && (
                    <div className="flex gap-2 p-1 bg-blue-50/50 rounded-xl">
                        {(['url', 'file', 'embed'] as const).map(source => (
                            <button 
                                key={source}
                                type="button"
                                onClick={() => setFormData({...formData, videoSource: source})}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${formData.videoSource === source ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-400'}`}
                            >
                                {source === 'url' ? 'LINK' : source === 'file' ? 'ARCHIVO' : 'EMBED'}
                            </button>
                        ))}
                    </div>
                )}

                {(formData.contentType === 'link' || (formData.contentType === 'video' && (formData.videoSource === 'url' || formData.videoSource === 'embed'))) && (
                    <div className="relative">
                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            value={formData.externalLink}
                            onChange={e => setFormData({...formData, externalLink: e.target.value})}
                            placeholder={formData.videoSource === 'embed' ? "Pega el código <iframe> o la ID del video..." : " https://..."}
                            className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>
                )}

                {(formData.contentType === 'file' || formData.contentType === 'document' || (formData.contentType === 'video' && formData.videoSource === 'file')) && (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${selectedFile ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                    >
                        <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} />
                        {selectedFile ? (
                            <>
                                <div className="p-3 bg-white rounded-full text-green-600 shadow-sm">
                                    <Upload size={20} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-green-700">{selectedFile.name}</p>
                                    <p className="text-[10px] text-green-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700"
                                >
                                    Quitar archivo
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-white rounded-full text-slate-400 shadow-sm">
                                    <Upload size={20} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-600">Haz clic para subir un archivo</p>
                                    <p className="text-[10px] text-slate-400">PDF, Imágenes o Video (Max. 50MB)</p>
                                </div>
                            </>
                        )}
                        {uploadProgress !== null && (
                            <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        )}
                    </div>
                )}

                <textarea 
                    value={formData.body}
                    onChange={e => setFormData({...formData, body: e.target.value})}
                    placeholder="Descripción o notas internas..."
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 px-5 text-sm outline-none min-h-[100px] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button 
                    onClick={onCancel}
                    className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={!formData.title || isSubmitting}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-2xl text-xs font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                    {isSubmitting ? "Procesando..." : "Guardar Contenido"}
                </button>
            </div>
        </div>
    )
}

