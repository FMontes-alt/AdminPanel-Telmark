"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { 
    Plus, 
    ArrowLeft,
    Eye,
    FolderPlus,
    Lock,
    AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { AdminPageHeader } from "@/components/ui/admin-page-header"
// Actions
import { 
    createCategory,
    reorderCategories,
    deleteCategory,
    updateCategory
} from "@/actions/categories"
import { createSubcategory, deleteSubcategory, updateSubcategory } from "@/actions/subcategories"
import { createItem, deleteItem } from "@/actions/items"
import { getSectionHierarchy, type SectionHierarchy } from "@/actions/hierarchy"
import { bulkCreateHierarchy } from "@/actions/bulk-actions"

// Components
import DeleteModal from "./components/DeleteModal"
import CategoryList from "./components/CategoryList"
import HierarchyBuilder from "./components/HierarchyBuilder"

export default function SectionDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    
    const [section, setSection] = useState<SectionHierarchy | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    
    // UI State
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [addingSubId, setAddingSubId] = useState<string | null>(null)
    const [addingItemId, setAddingItemId] = useState<string | null>(null)

    // Delete Confirmation State
    const [deletingId, setDeletingId] = useState<{ id: string, type: 'category' | 'subcategory' | 'item' } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await getSectionHierarchy(slug)
            setSection(data)
            
            // Auto-expand if specialized and has categories
            const config = data?.config as any
            if (data && config?.template && config.template !== 'GENERICO' && data.categories.length > 0) {
                setExpandedCategory(data.categories[0].id)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setIsLoading(false)
        }
    }, [slug])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleAddSubcategory = async (categoryId: string, name: string) => {
        if (!name) return
        try {
            const subSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createSubcategory({ 
                categoryId, 
                name, 
                slug: subSlug 
            })
            setAddingSubId(null)
            fetchData()
        } catch (error) {
            console.error("Error creating subcategory:", error)
        }
    }

    const handleAddItem = async (subcategoryId: string, data: any) => {
        try {
            const itemSlug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createItem({ 
                ...data, 
                subcategoryId, 
                slug: itemSlug 
            })
            setAddingItemId(null)
            fetchData()
        } catch (error) {
            console.error("Error creating item:", error)
        }
    }

    const handleBulkCreate = async (data: any) => {
        if (!section) return
        try {
            await bulkCreateHierarchy({
                sectionId: section.id,
                ...data
            })
            setIsAddingCategory(false)
            fetchData()
        } catch (error) {
            console.error("Error in bulk create:", error)
        }
    }

    const handleUpdateCategory = async (id: string, name: string) => {
        try {
            await updateCategory(id, { name })
            fetchData()
        } catch (error) {
            console.error("Error updating category:", error)
        }
    }

    const handleUpdateSubcategory = async (id: string, name: string) => {
        try {
            await updateSubcategory(id, { name })
            fetchData()
        } catch (error) {
            console.error("Error updating subcategory:", error)
        }
    }

    const handleDeleteSubcategory = async (id: string) => {
        try {
            await deleteSubcategory(id)
            fetchData()
        } catch (error) {
            console.error("Error deleting subcategory:", error)
        }
    }

    const handleReorder = async (newCategories: any[]) => {
        if (!section) return
        
        // Optimistic UI update
        const previousCategories = section.categories
        setSection({ ...section, categories: newCategories })
        
        try {
            await reorderCategories(newCategories.map(c => c.id))
        } catch (error) {
            console.error("Error reordering categories:", error)
            // Rollback on error
            setSection({ ...section, categories: previousCategories })
        }
    }

    const confirmDelete = async () => {
        if (!deletingId) return
        setIsDeleting(true)
        try {
            if (deletingId.type === 'category') {
                await deleteCategory(deletingId.id)
            } else if (deletingId.type === 'subcategory') {
                await deleteSubcategory(deletingId.id)
            } else if (deletingId.type === 'item') {
                await deleteItem(deletingId.id)
            }
            setDeletingId(null)
            fetchData()
        } catch (error) {
            console.error("Error deleting:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400 font-medium">Cargando configuración...</div>
    if (!section) return (
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-400">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Sección no encontrada</h2>
                <p className="text-slate-500 text-sm">No existe ninguna sección con el slug <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">{slug}</code></p>
                <Link href="/admin/sections" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                    Volver a Secciones
                </Link>
            </div>
        </div>
    )
    const isLocked = (section.config as any)?.isLocked || false

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            {isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                        <Lock size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-amber-900 font-black uppercase tracking-tight text-sm">Sección Bloqueada</h3>
                        <p className="text-amber-700 text-xs font-medium">Esta sección tiene activo el bloque total. No se pueden realizar cambios en la estructura ni en los contenidos hasta que se desbloquee.</p>
                    </div>
                    <Link 
                        href="/admin/sections"
                        className="px-6 py-3 bg-amber-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-800 transition-all shadow-lg shadow-amber-900/20"
                    >
                        Volver
                    </Link>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link 
                    href="/admin/sections"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold"
                >
                    <ArrowLeft size={16} />
                    Volver a Secciones
                </Link>
                
                <AdminPageHeader
                    category={`Sección / ${(section.config as any)?.template || 'GENERICO'}`}
                    title={<>{section.name}</>}
                    description="Estructura jerárquica de contenidos para esta área."
                >
                    <Link 
                        href={`/dashboard/${section.slug}`}
                        target="_blank"
                        className="bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Eye size={18} className="text-blue-500" />
                        Vista Pública
                    </Link>
                    <button 
                        onClick={() => setIsAddingCategory(true)}
                        disabled={isLocked}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg group ${
                            isLocked 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                        }`}
                    >
                        {isLocked ? <Lock size={18} /> : <Plus size={18} className="transition-transform" />}
                        Nueva Categoría
                    </button>
                </AdminPageHeader>
            </div>

            {/* Content Structure */}
            <div className="space-y-4">
                {isAddingCategory && (
                    <HierarchyBuilder 
                        sectionSlug={slug}
                        sectionTemplate={(section.config as any)?.template || "GENERICO"}
                        onSubmit={handleBulkCreate}
                        onCancel={() => setIsAddingCategory(false)}
                    />
                )}

                {section.categories.length > 0 ? (
                    <CategoryList 
                        categories={section.categories}
                        isLocked={isLocked}
                        onReorder={handleReorder}
                        onUpdateCategory={handleUpdateCategory}
                        onUpdateSub={handleUpdateSubcategory}
                        expandedCategoryId={expandedCategory}
                        onToggleExpand={(id) => setExpandedCategory(expandedCategory === id ? null : id)}
                        addingSubId={addingSubId}
                        onStartAddingSub={(id) => setAddingSubId(id)}
                        onCancelAddingSub={() => setAddingSubId(null)}
                        onAddSub={handleAddSubcategory}
                        onDeleteCategory={(id) => setDeletingId({ id, type: 'category' })}
                        onDeleteSubAction={async (id) => setDeletingId({ id, type: 'subcategory' })}
                        onDeleteItem={async (id) => setDeletingId({ id, type: 'item' })}
                        addingItemId={addingItemId}
                        onStartAddingItem={(id) => setAddingItemId(id)}
                        onCancelAddingItem={() => setAddingItemId(null)}
                        onAddItem={handleAddItem}
                        sectionSlug={slug}
                        sectionTemplate={(section.config as any)?.template || "GENERICO"}
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
