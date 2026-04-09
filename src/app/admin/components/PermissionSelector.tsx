"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, CheckSquare, Square, Search, Layers, Folder, FileText, Info, Users, ShieldCheck } from "lucide-react"

interface PermissionItem {
    id: string;
    name: string;
    type: "section" | "category" | "subcategory" | "item";
    children?: PermissionItem[];
}

interface InheritedPermission {
    targetId: string;
    targetType: string;
    sourceName: string;
}

interface PermissionSelectorProps {
    hierarchy: PermissionItem[];
    selectedItems: { targetType: string, targetId: string }[];
    inheritedPermissions: InheritedPermission[];
    onChange: (items: { targetType: string, targetId: string }[]) => void;
}

export function PermissionSelector({ hierarchy, selectedItems, inheritedPermissions = [], onChange }: PermissionSelectorProps) {
    const [expanded, setExpanded] = useState<string[]>([])
    const [search, setSearch] = useState("")

    // 1. Verificar si está seleccionado individualmente
    const isIndividuallySelected = (id: string) => selectedItems.some(i => i.targetId === id)

    // 2. Verificar si está heredado de un grupo
    const getInheritanceSource = (id: string) => inheritedPermissions.find(i => i.targetId === id)?.sourceName

    // 3. Verificar si está desbloqueado por un ancestro (Sección o Categoría padre)
    const getParentUnlockSource = (item: PermissionItem, currentPath: PermissionItem[]): string | null => {
        for (const ancestor of currentPath) {
            // Si el ancestro está seleccionado (individual o por grupo), este item está desbloqueado
            if (isIndividuallySelected(ancestor.id)) return `Individual (${ancestor.type})`
            const groupSource = getInheritanceSource(ancestor.id)
            if (groupSource) return `Grupo: ${groupSource} (${ancestor.type})`
        }
        return null
    }

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
        
        const currentlySelectedCount = itemAndChildren.filter(i => isIndividuallySelected(i.targetId)).length
        const shouldSelect = currentlySelectedCount < itemAndChildren.length

        if (shouldSelect) {
            const newItems = [...selectedItems]
            itemAndChildren.forEach(i => {
                if (!isIndividuallySelected(i.targetId)) {
                    newItems.push({ targetType: i.targetType, targetId: i.targetId })
                }
            })
            onChange(newItems)
        } else {
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

    const renderItem = (item: PermissionItem, depth = 0, path: PermissionItem[] = []) => {
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expanded.includes(item.id)
        
        const selectedManually = isIndividuallySelected(item.id)
        const groupSource = getInheritanceSource(item.id)
        const parentUnlockSource = getParentUnlockSource(item, path)
        
        // Estado final: ¿Está activo?
        const isActive = selectedManually || !!groupSource || !!parentUnlockSource
        
        // Tooltip o mensaje de estado
        let statusLabel = ""
        if (parentUnlockSource) statusLabel = `Desbloqueado por ${parentUnlockSource}`
        else if (groupSource) statusLabel = `Heredado de Grupo: ${groupSource}`

        // Filtro de búsqueda
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const hasMatchingChild = item.children?.some(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.children?.some(sc => sc.name.toLowerCase().includes(search.toLowerCase())))

        if (search && !matchesSearch && !hasMatchingChild) return null

        return (
            <div key={item.id} className="select-none">
                <div 
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${isActive ? 'bg-blue-50/30' : ''}`}
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
                        <div className="relative">
                            {selectedManually ? (
                                <CheckSquare size={16} className="text-blue-600" />
                            ) : (isActive) ? (
                                <div className="relative">
                                    <Square size={16} className="text-blue-200" />
                                    <ShieldCheck size={10} className="absolute inset-0 m-auto text-blue-600" />
                                </div>
                            ) : (
                                <Square size={16} className="text-slate-300" />
                            )}
                        </div>

                        {renderIcon(item.type)}
                        
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs truncate ${isActive ? 'font-bold text-blue-900' : 'text-slate-600 font-medium'}`}>
                                    {item.name}
                                </span>
                                {groupSource && (
                                    <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
                                        <Users size={8} />
                                        Grupo
                                    </div>
                                )}
                            </div>
                            {statusLabel && (
                                <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                                    {statusLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {(isExpanded || (search && hasMatchingChild)) && item.children && (
                    <div className="mt-1">
                        {item.children.map(child => renderItem(child, depth + 1, [...path, item]))}
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
                <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {selectedItems.length} Permisos Individuales
                    </p>
                    {inheritedPermissions.length > 0 && (
                        <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">
                            + {inheritedPermissions.length} Permisos por Grupos
                        </p>
                    )}
                </div>
                <button 
                    type="button" 
                    onClick={() => onChange([])}
                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700"
                >
                    Limpiar Individuales
                </button>
            </div>
        </div>
    )
}
