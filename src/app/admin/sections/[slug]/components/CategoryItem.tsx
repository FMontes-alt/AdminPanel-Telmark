"use client"

import { ChevronRight, Plus, Trash2, Settings2 } from "lucide-react"
import SubcategoryForm from "./SubcategoryForm"
import SubcategoryCard from "./SubcategoryCard"
import { Reorder } from "framer-motion"

interface CategoryItemProps {
    category: any
    isExpanded: boolean
    isAddingSub: boolean
    onToggleExpand: () => void
    onStartAddingSub: () => void
    onCancelAddingSub: () => void
    onAddSub: (name: string) => Promise<void>
    onDeleteCategory: () => void
    onDeleteSub: (id: string) => void
    onDeleteItem: (id: string) => void
    // Item adding state
    addingItemId: string | null
    onStartAddingItem: (subId: string) => void
    onCancelAddingItem: () => void
    onAddItem: (subId: string, data: any) => Promise<void>
    sectionSlug: string
}

export default function CategoryItem({
    category,
    isExpanded,
    isAddingSub,
    onToggleExpand,
    onStartAddingSub,
    onCancelAddingSub,
    onAddSub,
    onDeleteCategory,
    onDeleteSub,
    onDeleteItem,
    addingItemId,
    onStartAddingItem,
    onCancelAddingItem,
    onAddItem,
    sectionSlug
}: CategoryItemProps) {
    return (
        <Reorder.Item 
            value={category}
            id={category.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300 mb-4"
        >
            <div 
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100 rotate-90' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        <ChevronRight size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-900 text-lg tracking-tight">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                                {category.subcategories?.length || 0} Subcategorías
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-tight">
                                ID: {category.id.split('-')[0]}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={onStartAddingSub}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100"
                        title="Añadir Subcategoría"
                    >
                        <Plus size={18} />
                    </button>
                    <button 
                        onClick={onDeleteCategory}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100"
                        title="Eliminar Categoría"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl border border-transparent">
                        <Settings2 size={18} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    {isAddingSub && (
                        <SubcategoryForm 
                            onSubmit={onAddSub}
                            onCancel={onCancelAddingSub}
                        />
                    )}

                    {category.subcategories?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {category.subcategories.map((sub: any) => (
                                <SubcategoryCard 
                                    key={sub.id}
                                    sub={sub}
                                    isAddingItem={addingItemId === sub.id}
                                    onStartAddingItem={() => onStartAddingItem(sub.id)}
                                    onCancelAddingItem={onCancelAddingItem}
                                    onAddItem={(data) => onAddItem(sub.id, data)}
                                    onDeleteSub={() => onDeleteSub(sub.id)}
                                    onDeleteItem={onDeleteItem}
                                    sectionSlug={sectionSlug}
                                    categorySlug={category.slug}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
                            <div className="max-w-[200px] mx-auto space-y-3">
                                <p className="text-[11px] text-slate-400 font-medium">Empieza añadiendo subcategorías a {category.name}</p>
                                <button 
                                    onClick={onStartAddingSub}
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
        </Reorder.Item>
    )
}
