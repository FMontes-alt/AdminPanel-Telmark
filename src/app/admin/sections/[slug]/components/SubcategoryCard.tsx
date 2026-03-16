"use client"

import { FilePlus, Trash2 } from "lucide-react"
import ItemForm from "./ItemForm"
import ContentItem from "./ContentItem"

interface SubcategoryCardProps {
    sub: any
    isAddingItem: boolean
    onStartAddingItem: () => void
    onCancelAddingItem: () => void
    onAddItem: (data: any) => Promise<void>
    onDeleteSub: () => void
    onDeleteItem: (id: string) => void
}

export default function SubcategoryCard({ 
    sub, 
    isAddingItem, 
    onStartAddingItem, 
    onCancelAddingItem, 
    onAddItem,
    onDeleteSub,
    onDeleteItem
}: SubcategoryCardProps) {
    return (
        <div className="bg-slate-50/40 rounded-[28px] p-6 border border-slate-100/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group/sub">
            <div className="flex items-center justify-between mb-5">
                <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    {sub.name}
                </h4>
                <div className="flex items-center gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                    <button 
                        onClick={onStartAddingItem}
                        className="text-[10px] font-bold text-blue-600 bg-white px-3 py-1.5 rounded-xl uppercase tracking-tight flex items-center gap-1.5 shadow-sm border border-slate-100 hover:bg-blue-50 transition-colors"
                    >
                        <FilePlus size={14} />
                        Añadir Item
                    </button>
                    <button 
                        onClick={onDeleteSub}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {isAddingItem && (
                <ItemForm 
                    onSubmit={onAddItem}
                    onCancel={onCancelAddingItem}
                />
            )}

            <div className="space-y-2.5">
                {sub.items?.length > 0 ? (
                    sub.items.map((item: any) => (
                        <ContentItem 
                            key={item.id} 
                            item={item} 
                            onDelete={onDeleteItem} 
                        />
                    ))
                ) : (
                    <div className="py-8 text-center border-2 border-dashed border-slate-50 rounded-[24px] bg-white/50">
                        <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-widest">Sin contenidos</p>
                    </div>
                )}
            </div>
        </div>
    )
}
