"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
    Plus, 
    ChevronRight, 
    FileText, 
    Download, 
    Link as LinkIcon, 
    Info, 
    MoreVertical,
    FolderPlus,
    FilePlus,
    ArrowLeft,
    Eye
} from "lucide-react"
import Link from "next/link"
import { 
    getSections, 
    getCategoriesBySection, 
    createCategory,
    createSubcategory,
    createItem,
    getSubcategoriesByCategory,
    getItemsBySubcategory
} from "@/lib/actions/cms"

export default function SectionDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    
    const [section, setSection] = useState<any>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    
    // UI State
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")

    // Modals/Forms State
    const [isAddingSub, setIsAddingSub] = useState<string | null>(null)
    const [newSubName, setNewSubName] = useState("")
    
    const [isAddingItem, setIsAddingItem] = useState<string | null>(null)
    const [newItem, setNewItem] = useState({
        title: "",
        contentType: "info" as "info" | "document" | "file" | "link",
        body: "",
        externalLink: ""
    })

    useEffect(() => {
        if (slug) fetchData()
    }, [slug])

    const fetchData = async () => {
        setLoading(true)
        try {
            const allSections = await getSections()
            const currentSection = allSections.find((s: any) => s.slug === slug)
            if (currentSection) {
                setSection(currentSection)
                const cats = await getCategoriesBySection(currentSection.id)
                
                const catsWithSubs = await Promise.all(cats.map(async (cat: any) => {
                    const subs = await getSubcategoriesByCategory(cat.id)
                    const subsWithItems = await Promise.all(subs.map(async (sub: any) => {
                        const its = await getItemsBySubcategory(sub.id)
                        return { ...sub, items: its }
                    }))
                    return { ...cat, subcategories: subsWithItems }
                }))
                
                setCategories(catsWithSubs)
            }
        } catch (error) {
            console.error("Error fetching section detail:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!section || !newCategoryName) return
        try {
            const catSlug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createCategory(section.id, newCategoryName, catSlug)
            setNewCategoryName("")
            setIsAddingCategory(false)
            fetchData()
        } catch (error) {
            console.error("Error creating category:", error)
        }
    }

    const handleAddSub = async (categoryId: string) => {
        if (!newSubName) return
        try {
            const subSlug = newSubName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createSubcategory(categoryId, newSubName, subSlug)
            setNewSubName("")
            setIsAddingSub(null)
            fetchData()
        } catch (error) {
            console.error("Error adding subcategory:", error)
        }
    }

    const handleAddItem = async (subcategoryId: string) => {
        if (!newItem.title) return
        try {
            const itemSlug = newItem.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createItem({
                subcategoryId,
                title: newItem.title,
                slug: itemSlug,
                body: newItem.body,
                contentType: newItem.contentType
            })
            setNewItem({ title: "", contentType: "info", body: "", externalLink: "" })
            setIsAddingItem(null)
            fetchData()
        } catch (error) {
            console.error("Error adding item:", error)
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse text-slate-400 font-medium">Cargando configuración...</div>
    if (!section) return <div className="p-8 text-center text-red-500 font-bold">Sección no encontrada</div>

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link 
                    href="/admin/sections"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold"
                >
                    <ArrowLeft size={16} />
                    Volver a Secciones
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{section.name}</h1>
                        <p className="text-slate-500 text-sm mt-1">Estructura jerárquica de contenidos para esta área.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            href={`/dashboard/${section.slug}`}
                            target="_blank"
                            className="bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Eye size={18} />
                            Vista Pública
                        </Link>
                        <button 
                            onClick={() => setIsAddingCategory(true)}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                        >
                            <FolderPlus size={18} />
                            Nueva Categoría
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Structure */}
            <div className="space-y-4">
                {isAddingCategory && (
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 animate-in slide-in-from-top-4 duration-500">
                        <form onSubmit={handleAddCategory} className="flex gap-4">
                            <input 
                                autoFocus
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nombre de la nueva categoría..."
                                className="flex-1 bg-white border-slate-200 rounded-2xl py-3 px-6 text-sm focus:ring-4 focus:ring-blue-500/10 transition-all border outline-none font-medium shadow-sm"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                Crear
                            </button>
                            <button type="button" onClick={() => setIsAddingCategory(false)} className="bg-white text-slate-500 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all border border-slate-200">
                                Cancelar
                            </button>
                        </form>
                    </div>
                )}

                {categories.length > 0 ? (
                    categories.map((category) => (
                        <div key={category.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
                            <div 
                                className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${expandedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                        <ChevronRight size={20} className={`transition-transform duration-300 ${expandedCategory === category.id ? 'rotate-90' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900">{category.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                                            {category.subcategories?.length || 0} Subcategorías
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <button 
                                        onClick={() => setIsAddingSub(category.id)}
                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-lg">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {expandedCategory === category.id && (
                                <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                    {isAddingSub === category.id && (
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex gap-3">
                                            <input 
                                                autoFocus
                                                value={newSubName}
                                                onChange={e => setNewSubName(e.target.value)}
                                                placeholder="Nombre de la subcategoría..."
                                                className="flex-1 bg-white border-slate-200 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                            <button 
                                                onClick={() => handleAddSub(category.id)}
                                                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold"
                                            >
                                                Añadir
                                            </button>
                                            <button onClick={() => setIsAddingSub(null)} className="text-slate-400 text-xs font-bold">Cancelar</button>
                                        </div>
                                    )}

                                    {category.subcategories?.length > 0 ? (
                                        category.subcategories.map((sub: any) => (
                                            <div key={sub.id} className="bg-slate-50/30 rounded-2xl p-5 border border-slate-100/80">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        {sub.name}
                                                    </h4>
                                                    <button 
                                                        onClick={() => setIsAddingItem(sub.id)}
                                                        className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tight flex items-center gap-1"
                                                    >
                                                        <FilePlus size={12} />
                                                        Añadir Item
                                                    </button>
                                                </div>

                                                {isAddingItem === sub.id && (
                                                    <div className="bg-white p-4 rounded-xl border border-blue-100 mb-4 space-y-3 shadow-sm">
                                                        <input 
                                                            value={newItem.title}
                                                            onChange={e => setNewItem({...newItem, title: e.target.value})}
                                                            placeholder="Título del contenido..."
                                                            className="w-full bg-slate-50 border-slate-100 rounded-lg py-2 px-3 text-xs outline-none"
                                                        />
                                                        <div className="flex gap-2">
                                                            {(['info', 'document', 'file', 'link'] as const).map(type => (
                                                                <button 
                                                                    key={type}
                                                                    onClick={() => setNewItem({...newItem, contentType: type})}
                                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${newItem.contentType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                                                                >
                                                                    {type.toUpperCase()}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea 
                                                            value={newItem.body}
                                                            onChange={e => setNewItem({...newItem, body: e.target.value})}
                                                            placeholder="Contenido o descripción..."
                                                            className="w-full bg-slate-50 border-slate-100 rounded-lg py-2 px-3 text-xs outline-none min-h-[80px]"
                                                        />
                                                        <div className="flex justify-end gap-2 pt-2">
                                                            <button 
                                                                onClick={() => setIsAddingItem(null)}
                                                                className="text-[10px] font-bold text-slate-400"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAddItem(sub.id)}
                                                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold"
                                                            >
                                                                Guardar Item
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    {sub.items?.length > 0 ? (
                                                        sub.items.map((item: any) => (
                                                            <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center justify-between hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group/item">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover/item:text-blue-500 transition-colors">
                                                                        {item.contentType === 'file' && <Download size={14} />}
                                                                        {item.contentType === 'link' && <LinkIcon size={14} />}
                                                                        {item.contentType === 'document' && <FileText size={14} />}
                                                                        {item.contentType === 'info' && <Info size={14} />}
                                                                    </div>
                                                                    <span className="text-xs font-semibold text-slate-700">{item.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{item.contentType}</span>
                                                                    <MoreVertical size={12} className="text-slate-300 opacity-0 group-hover/item:opacity-100" />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-6 text-center">
                                                            <p className="text-[10px] text-slate-300 italic">No hay contenidos todavía</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
                                            <div className="max-w-[200px] mx-auto space-y-3">
                                                <p className="text-[11px] text-slate-400 font-medium">Empieza añadiendo subcategorías a {category.name}</p>
                                                <button 
                                                    onClick={() => setIsAddingSub(category.id)}
                                                    className="inline-flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:underline"
                                                >
                                                    <Plus size={14} />
                                                    Añadir Primera
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-[40px] border border-slate-200 shadow-sm">
                        <div className="max-w-sm mx-auto space-y-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                <Plus size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">Sin contenido configurado</h3>
                                <p className="text-sm text-slate-500">Crea la primera categoría para empezar a organizar la información de esta sección.</p>
                            </div>
                            <button 
                                onClick={() => setIsAddingCategory(true)}
                                className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                            >
                                Crear Categoría
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
