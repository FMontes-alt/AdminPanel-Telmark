"use client"

import { Plus, Zap, ArrowRight, Type, Link, Video, FileText, ChevronRight } from "lucide-react"
import { useState } from "react"
import { SECTION_TEMPLATES, SectionTemplateType } from "@/lib/constants/section-templates"

interface QuickCreateFormProps {
    sectionTemplate: string
    onSubmit: (data: {
        categoryName: string
        subcategoryName: string
        itemTitle: string
        itemContentType: "info" | "document" | "file" | "link" | "video"
        itemBody?: string
        itemExternalLink?: string
    }) => Promise<void>
    onCancel: () => void
}

export default function QuickCreateForm({ sectionTemplate, onSubmit, onCancel }: QuickCreateFormProps) {
    const template = SECTION_TEMPLATES[sectionTemplate as SectionTemplateType] || SECTION_TEMPLATES.GENERICO
    
    const [formData, setFormData] = useState({
        categoryName: "",
        subcategoryName: "",
        itemTitle: "",
        itemContentType: template.allowedContentTypes[0] as any,
        itemBody: "",
        itemExternalLink: ""
    })
    
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.categoryName || !formData.subcategoryName || !formData.itemTitle || isSubmitting) return
        
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-10 rounded-[40px] border border-blue-500/20 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10 group-hover:bg-blue-600/20 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 blur-[80px] -z-10" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10">
                    <Zap size={28} className="fill-current animate-pulse" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Creación Instantánea</h3>
                    <p className="text-blue-300/60 text-sm font-medium">Configura toda la jerarquía en un solo paso.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Category Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">1</span>
                            <label className="text-xs font-black uppercase tracking-widest text-blue-300/80">Categoría</label>
                        </div>
                        <input 
                            autoFocus
                            value={formData.categoryName}
                            onChange={e => setFormData({...formData, categoryName: e.target.value})}
                            placeholder="Ej: Documentación"
                            className="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all border placeholder:text-slate-600 font-bold"
                        />
                    </div>

                    {/* Subcategory Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">2</span>
                            <label className="text-xs font-black uppercase tracking-widest text-blue-300/80">Subcategoría</label>
                        </div>
                        <input 
                            value={formData.subcategoryName}
                            onChange={e => setFormData({...formData, subcategoryName: e.target.value})}
                            placeholder="Ej: Manuales de Usuario"
                            className="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all border placeholder:text-slate-600 font-bold"
                        />
                    </div>

                    {/* Item Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">3</span>
                            <label className="text-xs font-black uppercase tracking-widest text-blue-300/80">Ítem Inicial</label>
                        </div>
                        <input 
                            value={formData.itemTitle}
                            onChange={e => setFormData({...formData, itemTitle: e.target.value})}
                            placeholder="Ej: Guía de Inicio Rápido"
                            className="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all border placeholder:text-slate-600 font-bold"
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Additional Item Details (Optional / Conditional) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/5 p-8 rounded-[32px] border border-white/5">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-blue-300/80 ml-1">Tipo de Contenido</label>
                            <div className="flex flex-wrap gap-2">
                                {template.allowedContentTypes.map(type => (
                                    <button 
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({...formData, itemContentType: type as any})}
                                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${formData.itemContentType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}
                                    >
                                        {type === 'info' && <Type size={14} />}
                                        {type === 'link' && <Link size={14} />}
                                        {type === 'video' && <Video size={14} />}
                                        {(type === 'file' || type === 'document') && <FileText size={14} />}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(formData.itemContentType === 'link' || formData.itemContentType === 'video') && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                <label className="text-xs font-black uppercase tracking-widest text-blue-300/80 ml-1">Enlace Externo</label>
                                <div className="relative">
                                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input 
                                        value={formData.itemExternalLink}
                                        onChange={e => setFormData({...formData, itemExternalLink: e.target.value})}
                                        placeholder="https://..."
                                        className="w-full bg-white/5 border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-[13px] outline-none focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all border font-medium"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-blue-300/80 ml-1">Descripción / Cuerpo</label>
                        <textarea 
                            value={formData.itemBody}
                            onChange={e => setFormData({...formData, itemBody: e.target.value})}
                            placeholder="Escribe el contenido o descripción del ítem..."
                            className="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-6 text-white text-[13px] outline-none focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all border min-h-[120px] resize-none font-medium placeholder:text-slate-700"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest px-4 py-2"
                    >
                        Cancelar Proceso
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={!formData.categoryName || !formData.subcategoryName || !formData.itemTitle || isSubmitting}
                        className="group relative bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:bg-slate-800 disabled:shadow-none overflow-hidden"
                    >
                        <div className="relative z-10 flex items-center gap-3">
                            {isSubmitting ? "Procesando..." : (
                                <>
                                    Generar Jerarquía Completa
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                    </button>
                </div>
            </form>
        </div>
    )
}
