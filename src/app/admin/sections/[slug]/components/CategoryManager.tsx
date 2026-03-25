"use client"

import { useState, useEffect, useRef } from "react"
import { Trash2, Plus, Edit2, Check, X, Settings2, Hash } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CategoryManagerProps {
    category: any
    onUpdateCategory: (name: string) => Promise<void>
    onUpdateSub: (id: string, name: string) => Promise<void>
    onDeleteSub: (id: string) => Promise<void>
    onAddSub: (name: string) => Promise<void>
    onDeleteCategory: () => void
    onClose: () => void
}

export default function CategoryManager({
    category,
    onUpdateCategory,
    onUpdateSub,
    onDeleteSub,
    onAddSub,
    onDeleteCategory,
    onClose
}: CategoryManagerProps) {
    const [catName, setCatName] = useState(category.name)
    const [isEditingCat, setIsEditingCat] = useState(false)
    const [newSubName, setNewSubName] = useState("")
    const [editingSubId, setEditingSubId] = useState<string | null>(null)
    const [editSubName, setEditSubName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const catInputRef = useRef<HTMLInputElement>(null)
    const subInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditingCat && catInputRef.current) {
            catInputRef.current.focus()
            catInputRef.current.select()
        }
    }, [isEditingCat])

    const handleSaveCat = async () => {
        if (catName.trim() && catName !== category.name) {
            await onUpdateCategory(catName.trim())
        }
        setIsEditingCat(false)
    }

    const handleAddSub = async () => {
        if (!newSubName.trim() || isSubmitting) return
        setIsSubmitting(true)
        try {
            await onAddSub(newSubName.trim())
            setNewSubName("")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStartEditSub = (sub: any) => {
        setEditingSubId(sub.id)
        setEditSubName(sub.name)
    }

    const handleSaveSub = async (id: string) => {
        if (editSubName.trim()) {
            await onUpdateSub(id, editSubName.trim())
        }
        setEditingSubId(null)
    }

    return (
        <div className="bg-slate-50 border-t border-slate-100 p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header / Category Name Editing */}
            <div className="flex items-start justify-between">
                <div className="flex-1 max-w-xl">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Settings2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configuración General</span>
                    </div>
                    
                    {isEditingCat ? (
                        <div className="flex items-center gap-2">
                            <input 
                                ref={catInputRef}
                                value={catName}
                                onChange={e => setCatName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveCat()}
                                onBlur={handleSaveCat}
                                className="flex-1 bg-white border-2 border-blue-500 rounded-2xl px-5 py-3 text-xl font-black text-slate-900 shadow-xl outline-none"
                            />
                            <button onClick={handleSaveCat} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                                <Check size={24} />
                            </button>
                        </div>
                    ) : (
                        <div className="group flex items-center gap-4 cursor-pointer" onClick={() => setIsEditingCat(true)}>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{category.name}</h3>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                                <Edit2 size={16} />
                            </div>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={onDeleteCategory}
                    className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-colors border border-red-100/50"
                >
                    <Trash2 size={16} />
                    Eliminar Categoría
                </button>
            </div>

            <div className="h-px bg-slate-200/60" />

            {/* Subcategories Management */}
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
                        Subcategorías
                        <span className="px-2 py-0.5 bg-slate-200 text-[10px] rounded-full text-slate-500">
                            {category.subcategories?.length || 0}
                        </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Gestiona los grupos de contenido dentro de esta categoría.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                        {category.subcategories?.map((sub: any) => (
                            <motion.div 
                                key={sub.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between group shadow-sm hover:shadow-md transition-all"
                            >
                                {editingSubId === sub.id ? (
                                    <input 
                                        autoFocus
                                        value={editSubName}
                                        onChange={e => setEditSubName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveSub(sub.id)}
                                        onBlur={() => handleSaveSub(sub.id)}
                                        className="flex-1 bg-slate-50 border-none outline-none text-sm font-bold text-slate-900 rounded-lg px-2 py-1"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Hash size={14} className="text-slate-300 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700 truncate">{sub.name}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleStartEditSub(sub)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => onDeleteSub(sub.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New Subcategory Input Area */}
                    <div className="bg-blue-50/50 border-2 border-dashed border-blue-100/60 rounded-2xl p-2 flex items-center gap-2 focus-within:border-blue-400 transition-all">
                        <input 
                            value={newSubName}
                            onChange={e => setNewSubName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddSub()}
                            placeholder="Añadir nueva subcategoría..."
                            className="flex-1 bg-transparent border-none outline-none px-3 py-1.5 text-sm font-medium text-slate-700 placeholder:text-blue-300"
                        />
                        <button 
                            onClick={handleAddSub}
                            disabled={!newSubName.trim() || isSubmitting}
                            className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                >
                    Finalizar Gestión
                </button>
            </div>
        </div>
    )
}
