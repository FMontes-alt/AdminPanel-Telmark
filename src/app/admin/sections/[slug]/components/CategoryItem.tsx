"use client"

import { ChevronRight, Plus, Trash2, Settings2, Check, X, Lock } from "lucide-react"
import { useState } from "react"
import SubcategoryForm from "./SubcategoryForm"
import SubcategoryCard from "./SubcategoryCard"
import CategoryManager from "./CategoryManager"
import { Reorder, AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CategoryItemProps {
    category: any
    isExpanded: boolean
    isAddingSub: boolean
    onToggleExpand: () => void
    onUpdateCategory: (name: string) => Promise<void>
    onStartAddingSub: () => void
    onCancelAddingSub: () => void
    onAddSub: (name: string) => Promise<void>
    onDeleteCategory: () => void
    onUpdateSub: (id: string, name: string) => Promise<void>
    onDeleteSubAction: (id: string) => Promise<void>
    onDeleteItem: (id: string) => Promise<void>
    // Item adding state
    addingItemId: string | null
    onStartAddingItem: (subId: string) => void
    onCancelAddingItem: () => void
    onAddItem: (subId: string, data: any) => Promise<void>
    sectionSlug: string
    sectionTemplate: string
    isLocked?: boolean
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
    onUpdateCategory,
    onUpdateSub,
    onDeleteSubAction,
    onDeleteItem,
    addingItemId,
    onStartAddingItem,
    onCancelAddingItem,
    onAddItem,
    sectionSlug,
    sectionTemplate,
    isLocked = false
}: CategoryItemProps) {
    const [isManaging, setIsManaging] = useState(false)

    return (
        <Reorder.Item 
            value={category}
            id={category.id}
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileDrag={{ 
                scale: 1.02, 
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                zIndex: 50
            }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-4"
        >
            <div 
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100 rotate-90' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        <ChevronRight size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 text-lg tracking-tight">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                                {category.subcategories?.length || 0} Subcategorías
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-tight">
                                ID: {category.id?.split('-')[0] || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
                    <button 
                        disabled={isLocked}
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsManaging(!isManaging)
                        }}
                        className={cn(
                            "group/btn px-4 py-2 border rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-wider transition-all",
                            isLocked 
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                : isManaging 
                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 shadow-sm"
                        )}
                    >
                        {isLocked ? (
                            <Lock size={16} />
                        ) : (
                            <Settings2 size={16} className={cn("transition-transform duration-500", isManaging && "rotate-180")} />
                        )}
                        {isLocked ? "Bloqueado" : isManaging ? "Cerrar" : "Gestionar"}
                    </button>
                </div>

            <AnimatePresence>
                {isManaging && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <CategoryManager 
                            category={category}
                            onUpdateCategory={onUpdateCategory}
                            onUpdateSub={onUpdateSub}
                            onDeleteSub={onDeleteSubAction}
                            onAddSub={onAddSub}
                            onDeleteCategory={onDeleteCategory}
                            onClose={() => setIsManaging(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 space-y-4">
                            {isAddingSub && (
                                <SubcategoryForm 
                                    onSubmit={onAddSub}
                                    onCancel={onCancelAddingSub}
                                />
                            )}
        
                            {category.subcategories?.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {category.subcategories?.map((sub: any) => (
                                        <SubcategoryCard 
                                            key={sub.id}
                                            sub={sub}
                                            isLocked={isLocked}
                                            isAddingItem={addingItemId === sub.id}
                                            onStartAddingItem={() => onStartAddingItem(sub.id)}
                                            onCancelAddingItem={onCancelAddingItem}
                                            onAddItem={(data) => onAddItem(sub.id, data)}
                                            onDeleteSub={() => onDeleteSubAction(sub.id)}
                                            onDeleteItem={onDeleteItem}
                                            sectionSlug={sectionSlug}
                                            categorySlug={category.slug}
                                            sectionTemplate={sectionTemplate}
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
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    )
}
