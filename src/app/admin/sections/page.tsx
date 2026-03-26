"use client"

import { useState, useEffect } from "react"
import { SectionsHeader } from "./components/SectionsHeader"
import { SectionsList } from "./components/SectionsList"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { getSections, createSection, deleteSection, updateSection } from "@/actions/sections"
import { SECTION_TEMPLATE_OPTIONS, SectionTemplateType } from "@/lib/constants/section-templates"
import { Layout, FileText, Video, ShieldCheck } from "lucide-react"

export default function SectionsPage() {
    const [sections, setSections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [deletingSection, setDeletingSection] = useState<{ id: string, name: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    
    // Form state
    const [newName, setNewName] = useState("")
    const [newSlug, setNewSlug] = useState("")
    const [newCoverUrl, setNewCoverUrl] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<SectionTemplateType>("GENERICO")

    useEffect(() => {
        fetchSections()
    }, [])

    const fetchSections = async () => {
        setLoading(true)
        try {
            const data = await getSections()
            setSections(data || [])
        } catch (error) {
            console.error("Error fetching sections:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createSection({ 
                name: newName, 
                slug: newSlug,
                config: { 
                    coverUrl: newCoverUrl,
                    template: selectedTemplate
                }
            })
            setNewName("")
            setNewSlug("")
            setNewCoverUrl("")
            setIsAdding(false)
            fetchSections()
        } catch (error) {
            console.error("Error adding section:", error)
        }
    }

    const handleUpdateSection = async (id: string, config: any) => {
        try {
            await updateSection(id, { config })
            // Update local state for immediate feedback
            setSections(prev => prev.map(s => s.id === id ? { ...s, config } : s))
        } catch (error) {
            console.error("Error updating section:", error)
        }
    }

    const confirmDelete = async () => {
        if (!deletingSection) return
        setIsDeleting(true)
        try {
            await deleteSection(deletingSection.id)
            setDeletingSection(null)
            fetchSections()
        } catch (error) {
            console.error("Error deleting section:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            <SectionsHeader 
                isAdding={isAdding} 
                onToggleAdd={() => setIsAdding(!isAdding)} 
            />

            {/* Add Section Form (Minimalist & Integrated) */}
            {isAdding && (
                <div className="bg-white/70 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden relative">
                    <form onSubmit={handleAddSection} className="relative z-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Comercial</label>
                                <input 
                                    value={newName}
                                    onChange={(e) => {
                                        setNewName(e.target.value)
                                        setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                                    }}
                                    type="text"
                                    placeholder="Ej: ADESLAS SALUD"
                                    className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm transition-all border outline-none font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Slug URL</label>
                                <input 
                                    value={newSlug}
                                    onChange={(e) => setNewSlug(e.target.value)}
                                    type="text"
                                    placeholder="ej-adeslas-salud"
                                    className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm transition-all border outline-none font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5"
                                    required
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">URL Portada</label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <input 
                                            value={newCoverUrl}
                                            onChange={(e) => setNewCoverUrl(e.target.value)}
                                            type="text"
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm transition-all border outline-none font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5"
                                        />
                                    </div>
                                    {newCoverUrl && (
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm">
                                            <img 
                                                src={newCoverUrl} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error"
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Template Selector */}
                            <div className="space-y-3 lg:col-span-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Función de la Sección</label>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {SECTION_TEMPLATE_OPTIONS.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => setSelectedTemplate(tpl.id)}
                                            className={`flex flex-col items-start p-4 rounded-3xl border-2 transition-all text-left gap-3 ${
                                                selectedTemplate === tpl.id 
                                                ? "border-blue-600 bg-white ring-4 ring-blue-500/10 shadow-lg shadow-blue-500/10" 
                                                : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                                            }`}
                                        >
                                            <div className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center ${selectedTemplate === tpl.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-slate-400 border border-slate-100"}`}>
                                                {tpl.id === 'GENERICO' && <Layout size={18} />}
                                                {tpl.id === 'DOCUMENTOS' && <FileText size={18} />}
                                                {tpl.id === 'VIDEOS' && <Video size={18} />}
                                                {tpl.id === 'POLIZAS' && <ShieldCheck size={18} />}
                                            </div>
                                            <div>
                                                <p className={`text-[11px] font-extrabold uppercase tracking-tight ${selectedTemplate === tpl.id ? "text-blue-700" : "text-slate-900"}`}>{tpl.label}</p>
                                                <p className="text-[9px] text-slate-500 font-medium leading-tight mt-1">{tpl.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                            <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-[20px] text-xs font-bold uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
                                Crear Sección
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <SectionsList 
                sections={sections}
                loading={loading}
                onDelete={(id, name) => setDeletingSection({ id, name })}
                onUpdate={handleUpdateSection}
                onAddFirst={() => setIsAdding(true)}
                isDeletingId={deletingSection?.id || null}
            />

            <DeleteConfirmModal 
                isOpen={!!deletingSection}
                onClose={() => setDeletingSection(null)}
                onConfirm={confirmDelete}
                targetName={deletingSection?.name || ""}
                isDeleting={isDeleting}
            />
        </div>
    )
}
