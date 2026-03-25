"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { 
    Plus, 
    ArrowLeft,
    Eye,
    FolderPlus
} from "lucide-react"
import Link from "next/link"
import { AdminPageHeader } from "@/components/ui/admin-page-header"
import { 
    createCategory,
    reorderCategories,
    deleteCategory
} from "@/actions/categories"
import { createSubcategory, deleteSubcategory } from "@/actions/subcategories"
import { createItem, deleteItem } from "@/actions/items"
import { getSectionHierarchy, type SectionHierarchy } from "@/actions/hierarchy"

// Components
import DeleteModal from "./components/DeleteModal"
import CategoryForm from "./components/CategoryForm"
import CategoryList from "./components/CategoryList"

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

    const handleAddCategory = async (name: string) => {
        if (!section || !name) return
        try {
            const catSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await createCategory({ 
                sectionId: section.id, 
                name, 
                slug: catSlug 
            })
            setIsAddingCategory(false)
            fetchData()
        } catch (error) {
            console.error("Error creating category:", error)
        }
    }

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
    if (!section) return <div className="p-8 text-center text-red-500 font-bold">Sección no encontrada</div>

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
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
                </AdminPageHeader>
            </div>

            {/* Content Structure */}
            <div className="space-y-4">
                {isAddingCategory && (
                    <CategoryForm 
                        onSubmit={handleAddCategory}
                        onCancel={() => setIsAddingCategory(false)}
                    />
                )}

                {section.categories.length > 0 ? (
                    <CategoryList 
                        categories={section.categories}
                        onReorder={handleReorder}
                        expandedCategoryId={expandedCategory}
                        onToggleExpand={(id) => setExpandedCategory(expandedCategory === id ? null : id)}
                        addingSubId={addingSubId}
                        onStartAddingSub={(id) => setAddingSubId(id)}
                        onCancelAddingSub={() => setAddingSubId(null)}
                        onAddSub={handleAddSubcategory}
                        onDeleteCategory={(id) => setDeletingId({ id, type: 'category' })}
                        onDeleteSub={(id) => setDeletingId({ id, type: 'subcategory' })}
                        onDeleteItem={(id) => setDeletingId({ id, type: 'item' })}
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
