"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
    Plus, 
    ArrowLeft,
    Eye,
    FolderPlus
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

// Components
import DeleteModal from "./components/DeleteModal"
import CategoryForm from "./components/CategoryForm"
import CategoryList from "./components/CategoryList"

export default function SectionDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    
    const [section, setSection] = useState<any>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    
    // UI State
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const [isAddingCategory, setIsAddingCategory] = useState(false)

    // Delete Confirmation State
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Modals/Forms State
    const [addingSubId, setAddingSubId] = useState<string | null>(null)
    const [addingItemId, setAddingItemId] = useState<string | null>(null)

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

    const handleAddCategory = async (name: string) => {
        if (!section || !name) return
        try {
            const catSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createCategory(section.id, name, catSlug)
            setIsAddingCategory(false)
            fetchData()
        } catch (error) {
            console.error("Error creating category:", error)
        }
    }

    const handleAddSub = async (categoryId: string, name: string) => {
        if (!name) return
        try {
            const subSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createSubcategory(categoryId, name, subSlug)
            setAddingSubId(null)
            fetchData()
        } catch (error) {
            console.error("Error adding subcategory:", error)
        }
    }

    const handleAddItem = async (subcategoryId: string, data: any) => {
        if (!data.title) return
        try {
            const itemSlug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createItem({
                subcategoryId,
                title: data.title,
                slug: itemSlug,
                body: data.body,
                contentType: data.contentType
            })
            setAddingItemId(null)
            fetchData()
        } catch (error) {
            console.error("Error adding item:", error)
        }
    }

    const handleReorder = (newOrder: any[]) => {
        setCategories(newOrder)
        // Log for colleague to implement persistence
        console.log("New order to persist:", newOrder.map(c => c.id))
    }

    const confirmDelete = async () => {
        if (!deletingId) return
        setIsDeleting(true)
        try {
            // Placeholder: The actual implementation will be in cms actions
            console.log(`Confirming delete for ${deletingId}`)
            setDeletingId(null)
        } catch (error) {
            console.error("Error deleting:", error)
        } finally {
            setIsDeleting(false)
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
                            className="bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                        >
                            <Eye size={18} className="text-blue-500" />
                            Vista Pública
                        </Link>
                        <button 
                            onClick={() => setIsAddingCategory(true)}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95 group"
                        >
                            <FolderPlus size={18} className="group-hover:scale-110 transition-transform" />
                            Nueva Categoría
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Structure */}
            <div className="space-y-4">
                {isAddingCategory && (
                    <CategoryForm 
                        onSubmit={handleAddCategory}
                        onCancel={() => setIsAddingCategory(false)}
                    />
                )}

                {categories.length > 0 ? (
                    <CategoryList 
                        categories={categories}
                        onReorder={handleReorder}
                        expandedCategoryId={expandedCategory}
                        onToggleExpand={(id) => setExpandedCategory(expandedCategory === id ? null : id)}
                        addingSubId={addingSubId}
                        onStartAddingSub={(id) => setAddingSubId(id)}
                        onCancelAddingSub={() => setAddingSubId(null)}
                        onAddSub={handleAddSub}
                        onDeleteCategory={(id) => setDeletingId(id)}
                        onDeleteSub={(id) => setDeletingId(id)}
                        onDeleteItem={(id) => setDeletingId(id)}
                        addingItemId={addingItemId}
                        onStartAddingItem={(id) => setAddingItemId(id)}
                        onCancelAddingItem={() => setAddingItemId(null)}
                        onAddItem={handleAddItem}
                    />
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

            <DeleteModal 
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    )
}
