"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, CheckSquare, Square, Search, Layers, Folder, FileText, Info } from "lucide-react"

interface PermissionItem {
    id: string;
    name: string;
    type: "section" | "category" | "subcategory" | "item";
    children?: PermissionItem[];
}

interface PermissionSelectorProps {
    hierarchy: PermissionItem[];
    selectedItems: { targetType: string, targetId: string }[];
    onChange: (items: { targetType: string, targetId: string }[]) => void;
}

export function PermissionSelector({ hierarchy, selectedItems, onChange }: PermissionSelectorProps) {
    const [expanded, setExpanded] = useState<string[]>([])
    const [search, setSearch] = useState("")

    const isSelected = (id: string) => selectedItems.some(i => i.targetId === id)

    const toggleExpand = (id: string) => {
        setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const getAllChildren = (item: PermissionItem): { targetType: string, targetId: string }[] => {
        let children: { targetType: string, targetId: string }[] = [{ targetType: item.type, targetId: item.id }]
        if (item.children) {
            item.children.forEach(child => {
                children = [...children, ...getAllChildren(child)]
            })
        }
        return children
    }

    const handleToggle = (item: PermissionItem) => {
        const itemAndChildren = getAllChildren(item)
        const itemIds = itemAndChildren.map(i => i.targetId)
        
        const currentlySelectedCount = itemAndChildren.filter(i => isSelected(i.targetId)).length
        const shouldSelect = currentlySelectedCount < itemAndChildren.length

        if (shouldSelect) {
            // Add missing children
            const newItems = [...selectedItems]
            itemAndChildren.forEach(i => {
                if (!isSelected(i.targetId)) {
                    newItems.push({ targetType: i.targetType, targetId: i.targetId })
                }
            })
            onChange(newItems)
        } else {
            // Remove all
            onChange(selectedItems.filter(i => !itemIds.includes(i.targetId)))
        }
    }

    const renderIcon = (type: string) => {
        switch (type) {
            case "section": return <Layers size={14} className="text-blue-500" />
            case "category": return <Folder size={14} className="text-amber-500" />
            case "subcategory": return <Folder size={14} className="text-emerald-500" />
            case "item": return <FileText size={14} className="text-slate-400" />
            default: return <Info size={14} />
        }
    }

    const renderItem = (item: PermissionItem, depth = 0) => {
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expanded.includes(item.id)
        const selected = isSelected(item.id)
        
        // Filter by search
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const hasMatchingChild = item.children?.some(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.children?.some(sc => sc.name.toLowerCase().includes(search.toLowerCase())))

        if (search && !matchesSearch && !hasMatchingChild) return null

        return (
            <div key={item.id} className="select-none">
                <div 
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${selected ? 'bg-blue-50/50' : ''}`}
                    style={{ marginLeft: `${depth * 20}px` }}
                >
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(item.id) }}
                        className={`p-1 hover:bg-slate-200 rounded-md transition-all ${!hasChildren ? 'invisible' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <div onClick={() => handleToggle(item)} className="flex items-center gap-2 flex-1 min-w-0">
                        {selected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} className="text-slate-300" />}
                        {renderIcon(item.type)}
                        <span className={`text-xs truncate ${selected ? 'font-bold text-blue-900' : 'text-slate-600 font-medium'}`}>
                            {item.name}
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-tighter ml-1">
                            {item.type}
                        </span>
                    </div>
                </div>

                {(isExpanded || (search && hasMatchingChild)) && item.children && (
                    <div className="mt-1">
                        {item.children.map(child => renderItem(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/30">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text"
                    placeholder="Buscar sección, categoría o elemento..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-300 transition-all shadow-sm"
                />
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2 space-y-1">
                {hierarchy.length > 0 ? (
                    hierarchy.map(section => renderItem(section))
                ) : (
                    <div className="py-10 text-center space-y-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <Layers size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargando Estructura...</p>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {selectedItems.length} Elementos Seleccionados
                </p>
                <button 
                    type="button" 
                    onClick={() => onChange([])}
                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700"
                >
                    Limpiar Todo
                </button>
            </div>
        </div>
    )
}
