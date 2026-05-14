"use client"

import { Plus, Trash2, FilePlus, ChevronRight, FileText, Link, Video, Type, Upload, X, Save, AlertCircle } from "lucide-react"
import { useState, useRef } from "react"
import { SECTION_TEMPLATES, SectionTemplateType } from "@/lib/constants/section-templates"
import { uploadFileAction } from "@/actions/storage"
import { cn, toSlug } from "@/lib/utils"
import AlertModal from "@/components/ui/AlertModal"

interface HierarchyBuilderProps {
    sectionSlug: string
    sectionTemplate: string
    onSubmit: (data: any) => Promise<void>
    onCancel: () => void
}

type ItemDraft = {
    id: string
    title: string
    contentType: "info" | "document" | "file" | "link" | "video"
    body: string
    externalLink: string
    file: File | null
    isUploading?: boolean
}

type SubcategoryDraft = {
    id: string
    name: string
    items: ItemDraft[]
}

export default function HierarchyBuilder({ sectionSlug, sectionTemplate, onSubmit, onCancel }: HierarchyBuilderProps) {
    const template = SECTION_TEMPLATES[sectionTemplate as SectionTemplateType] || SECTION_TEMPLATES.GENERICO
    
    const [categoryName, setCategoryName] = useState("")
    const [subcategories, setSubcategories] = useState<SubcategoryDraft[]>([
        { id: crypto.randomUUID(), name: "", items: [] }
    ])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [showValidation, setShowValidation] = useState(false)
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'error' | 'info' | 'success';
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "error"
    })

    const addSubcategory = () => {
        setSubcategories([...subcategories, { id: crypto.randomUUID(), name: "", items: [] }])
    }

    const removeSubcategory = (subId: string) => {
        setSubcategories(subcategories.filter(s => s.id !== subId))
    }

    const updateSubcategoryName = (subId: string, name: string) => {
        setSubcategories(subcategories.map(s => s.id === subId ? { ...s, name } : s))
    }

    const addItem = (subId: string) => {
        setSubcategories(subcategories.map(s => {
            if (s.id === subId) {
                return {
                    ...s,
                    items: [...s.items, { 
                        id: crypto.randomUUID(), 
                        title: "", 
                        contentType: template.allowedContentTypes[0] as any,
                        body: "",
                        externalLink: "",
                        file: null
                    }]
                }
            }
            return s
        }))
    }

    const updateItem = (subId: string, itemId: string, updates: Partial<ItemDraft>) => {
        setSubcategories(subcategories.map(s => {
            if (s.id === subId) {
                return {
                    ...s,
                    items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
                }
            }
            return s
        }))
    }

    const removeItem = (subId: string, itemId: string) => {
        setSubcategories(subcategories.map(s => {
            if (s.id === subId) {
                return { ...s, items: s.items.filter(i => i.id !== itemId) }
            }
            return s
        }))
    }

    const handleSaveAll = async () => {
        // Validación básica
        const hasEmptySub = subcategories.some(s => !s.name.trim())
        const hasEmptyItems = subcategories.some(s => s.items.some(i => !i.title.trim() && !i.file))

        if (!categoryName.trim() || hasEmptySub || hasEmptyItems) {
            setShowValidation(true)
            setAlertModal({
                isOpen: true,
                title: "Campos incompletos",
                message: "Por favor, rellena todos los nombres de categoría, subcategoría y títulos de ítems (marcados en rojo).",
                type: "error"
            })
            return
        }

        if (isSubmitting) return

        setIsSubmitting(true)
        setStatusMessage("Iniciando creación masiva...")

        try {
            const finalSubcategories = []

            for (const sub of subcategories) {
                const finalItems = []
                for (const item of sub.items) {
                    // Validar título
                    if (!item.title.trim() && !item.file) {
                        throw new Error(`El ítem en la subcategoría "${sub.name}" no tiene título.`)
                    }

                    let uploadedPath = ""
                    let itemTitle = item.title

                    if (item.file) {
                        // Si no hay título, usar nombre de archivo
                        if (!itemTitle) {
                            itemTitle = item.file.name.split('.').slice(0, -1).join('.') || item.file.name
                        }

                        setStatusMessage(`Subiendo archivo: ${item.file.name}...`)
                        updateItem(sub.id, item.id, { isUploading: true })
                        const uploadData = new FormData()
                        uploadData.append('file', item.file)
                        const result = await uploadFileAction(uploadData, sectionSlug, toSlug(categoryName), toSlug(sub.name))
                        uploadedPath = result.fullPath
                        updateItem(sub.id, item.id, { isUploading: false })
                    }

                    finalItems.push({
                        title: itemTitle,
                        contentType: item.contentType,
                        body: item.body,
                        externalLink: item.externalLink,
                        filePath: uploadedPath
                    })
                }

                finalSubcategories.push({
                    name: sub.name,
                    items: finalItems
                })
            }

            setStatusMessage("Guardando estructura en base de datos...")
            await onSubmit({
                categoryName,
                subcategories: finalSubcategories
            })
        } catch (error) {
            console.error(error)
            setAlertModal({
                isOpen: true,
                title: "Error al guardar",
                message: (error as any).message || "Ha ocurrido un error inesperado.",
                type: "error"
            })
            setStatusMessage("Error al guardar.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-slate-100 p-8 md:p-12 rounded-[48px] border-2 border-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-500 min-h-[600px] flex flex-col mb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                        <Plus size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Editor</h3>
                        <p className="text-slate-400 text-sm font-medium">Define la estructura completa y sube archivos de una vez.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="px-6 py-3 text-slate-400 font-bold hover:text-red-600 active:text-red-800 transition-colors uppercase text-[10px] tracking-widest">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveAll} 
                        disabled={isSubmitting || !categoryName}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : <Save size={16} />}
                        {isSubmitting ? "Procesando..." : "Guardar Categoría"}
                    </button>
                </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-600 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-tight">{statusMessage}</span>
                </div>
            )}

            <div className="space-y-12 flex-1">
                {/* 1. Categoría Principal */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm space-y-4">
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Nombre de la Categoría</label>
                    <input 
                        autoFocus
                        value={categoryName}
                        onChange={e => setCategoryName(e.target.value)}
                        placeholder="Ej: Documentación de Seguros"
                        className={cn(
                            "w-full bg-slate-50/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-xl transition-all border outline-none font-black text-slate-900",
                            showValidation && !categoryName.trim() && "border-red-500 bg-red-50/10 placeholder:text-red-300"
                        )}
                    />
                </div>

                {/* 2. Subcategorías */}
                <div className="space-y-8 pl-4 border-l-2 border-slate-100">
                    {subcategories.map((sub, sIdx) => (
                        <div key={sub.id} className="relative space-y-6">
                            {/* Subcategory Label & Delete */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 flex gap-4 items-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">
                                        {sIdx + 1}
                                    </div>
                                    <input 
                                        value={sub.name}
                                        onChange={e => updateSubcategoryName(sub.id, e.target.value)}
                                        placeholder="Nombre de la Subcategoría..."
                                        className={cn(
                                            "bg-transparent border-b-2 border-slate-200 focus:border-blue-500 py-1 text-sm font-black text-slate-700 outline-none w-full transition-colors",
                                            showValidation && !sub.name.trim() && "border-red-500 text-red-600 placeholder:text-red-300"
                                        )}
                                    />
                                </div>
                                <button onClick={() => removeSubcategory(sub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Items Area */}
                            <div className="pl-12 space-y-4">
                                {sub.items.map((item, iIdx) => (
                                    <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative group border-l-4 border-l-indigo-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            {/* Title & Type */}
                                            <div className="lg:col-span-5 space-y-3">
                                                <input 
                                                    value={item.title}
                                                    onChange={e => updateItem(sub.id, item.id, { title: e.target.value })}
                                                    placeholder="Título del Ítem..."
                                                    className={cn(
                                                        "w-full text-xs font-black text-slate-800 outline-none border-b border-slate-100 py-1 focus:border-indigo-400 transition-colors",
                                                        showValidation && !item.title.trim() && !item.file && "border-red-500 text-red-600 placeholder:text-red-300"
                                                    )}
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    {template.allowedContentTypes.map(type => (
                                                        <button 
                                                            key={type} 
                                                            onClick={() => updateItem(sub.id, item.id, { contentType: type as any })}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                                                item.contentType === type ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                                            )}
                                                        >
                                                            {type === 'info' && <Type size={12} />}
                                                            {type === 'link' && <Link size={12} />}
                                                            {type === 'video' && <Video size={12} />}
                                                            {(type === 'file' || type === 'document') && <FileText size={12} />}
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* File / Link Content */}
                                            <div className="lg:col-span-6 flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                {(item.contentType === 'link' || item.contentType === 'video') ? (
                                                    <div className="relative flex-1">
                                                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                                        <input 
                                                            value={item.externalLink}
                                                            onChange={e => updateItem(sub.id, item.id, { externalLink: e.target.value })}
                                                            placeholder="https://..."
                                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-[11px] outline-none"
                                                        />
                                                    </div>
                                                ) : item.contentType === 'info' ? (
                                                    <textarea 
                                                        value={item.body}
                                                        onChange={e => updateItem(sub.id, item.id, { body: e.target.value })}
                                                        placeholder="Descripción o notas..."
                                                        className="w-full bg-white border border-slate-100 rounded-xl py-2 px-4 text-[11px] outline-none min-h-[60px]"
                                                    />
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-between">
                                                        {item.file ? (
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                                    <FileText size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-700 truncate max-w-[120px]">{item.file.name}</p>
                                                                    <p className="text-[8px] font-bold text-slate-400 capitalize">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                                </div>
                                                                <button onClick={() => updateItem(sub.id, item.id, { file: null })} className="text-slate-400 hover:text-red-500 transition-colors">
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer group/upload relative overflow-hidden">
                                                                <input 
                                                                    type="file" 
                                                                    multiple
                                                                    onChange={e => {
                                                                        const files = Array.from(e.target.files || [])
                                                                        if (files.length === 0) return

                                                                        // Primer archivo: actualiza el ítem actual
                                                                        const firstFile = files[0]
                                                                        const firstTitle = item.title || firstFile.name.split('.').slice(0, -1).join('.') || firstFile.name
                                                                        updateItem(sub.id, item.id, { 
                                                                            file: firstFile,
                                                                            title: firstTitle
                                                                        })

                                                                        // Archivos adicionales: crea nuevos ítems
                                                                        if (files.length > 1) {
                                                                            const newItems: ItemDraft[] = files.slice(1).map(file => ({
                                                                                id: crypto.randomUUID(),
                                                                                title: file.name.split('.').slice(0, -1).join('.') || file.name,
                                                                                contentType: item.contentType,
                                                                                body: "",
                                                                                externalLink: "",
                                                                                file: file
                                                                            }))

                                                                            setSubcategories(prev => prev.map(s => {
                                                                                if (s.id === sub.id) {
                                                                                    // Insertar después del ítem actual
                                                                                    const currentIdx = s.items.findIndex(i => i.id === item.id)
                                                                                    const updatedItems = [...s.items]
                                                                                    updatedItems.splice(currentIdx + 1, 0, ...newItems)
                                                                                    return { ...s, items: updatedItems }
                                                                                }
                                                                                return s
                                                                            }))
                                                                        }
                                                                    }}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                />
                                                                <div className="flex items-center gap-2 text-slate-400 group-hover/upload:text-indigo-500 transition-colors">
                                                                    <Upload size={14} />
                                                                    <span className="text-[10px] font-black uppercase tracking-tight">Seleccionar uno o varios archivos</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="lg:col-span-1 flex items-center justify-end">
                                                <button onClick={() => removeItem(sub.id, item.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => addItem(sub.id)}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all font-black text-[10px] uppercase tracking-widest"
                                >
                                    <FilePlus size={16} />
                                    Añadir Ítem
                                </button>
                            </div>
                        </div>
                    ))}

                    <button 
                        onClick={addSubcategory}
                        className="w-full py-6 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[32px] flex items-center justify-center gap-4 text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all font-black text-xs uppercase tracking-[0.2em]"
                    >
                        <Plus size={20} />
                        Añadir Nueva Subcategoría
                    </button>
                </div>
            </div>

            <AlertModal 
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type as any}
            />
        </div>
    )
}
