"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, ExternalLink } from "lucide-react"
import { getSections, createSection, deleteSection } from "@/actions/sections"

export default function SectionsPage() {
    const [sections, setSections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [newName, setNewName] = useState("")
    const [newSlug, setNewSlug] = useState("")

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
            await createSection({ name: newName, slug: newSlug })
            setNewName("")
            setNewSlug("")
            setIsAdding(false)
            fetchSections()
        } catch (error) {
            console.error("Error adding section:", error)
        }
    }

    const handleDeleteSection = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta sección y todo su contenido?")) return
        setIsDeleting(id)
        try {
            await deleteSection(id)
            fetchSections()
        } catch (error) {
            console.error("Error deleting section:", error)
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestionar Secciones</h1>
                    <p className="text-slate-500 text-sm">Crea y edita las áreas principales (Adeslas, Energía, etc.)</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Nueva Sección
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <form onSubmit={handleAddSection} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre</label>
                            <input 
                                value={newName}
                                onChange={(e) => {
                                    setNewName(e.target.value)
                                    setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                                }}
                                type="text"
                                placeholder="Ej: ADESLAS"
                                className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all border outline-none font-medium"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Slug (URL)</label>
                            <input 
                                value={newSlug}
                                onChange={(e) => setNewSlug(e.target.value)}
                                type="text"
                                placeholder="ej-adeslas"
                                className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all border outline-none font-medium"
                                required
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                                Guardar
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-slate-100/50 rounded-2xl animate-pulse" />
                    ))
                ) : sections.length > 0 ? (
                    sections.map((section) => (
                        <div key={section.id} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">{section.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono">/{section.slug}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteSection(section.id)}
                                        disabled={isDeleting === section.id}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={16} className={isDeleting === section.id ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activo</span>
                                <a 
                                    href={`/admin/sections/${section.slug}`}
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    Configurar <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="max-w-xs mx-auto space-y-4">
                            <p className="text-slate-500 font-medium">No hay secciones todavía. ¡Crea la primera!</p>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Plus size={20} />
                                Empezar ahora
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
