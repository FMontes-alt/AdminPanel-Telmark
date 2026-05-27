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
    const [alert, setAlert] = useState<{ message: string, type: 'info' | 'warning' } | null>(null)

    const isIndividuallySelected = (id: string) => selectedItems.some(i => i.targetId === id)

    // Helper para limpiar la alerta tras unos segundos
    const triggerAlert = (message: string) => {
        setAlert({ message, type: 'warning' })
        setTimeout(() => setAlert(null), 4000)
    }

    const getInheritanceSource = (id: string) => inheritedPermissions.find(i => i.targetId === id)?.sourceName

    const getParentUnlockSource = (item: PermissionItem, currentPath: PermissionItem[]): string | null => {
        for (const ancestor of currentPath) {
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

        if (!shouldSelect) {
            // Si vamos a desmarcar, comprobamos si algún hijo o el propio item tiene herencia
            const hasGroupPerm = itemAndChildren.some(i => !!getInheritanceSource(i.targetId))
            if (hasGroupPerm) {
                triggerAlert(`Atención: Algunos elementos seguirán activos porque pertenecen a un grupo asignado al usuario.`)
            }
            onChange(selectedItems.filter(i => !itemIds.includes(i.targetId)))
        } else {
            const newItems = [...selectedItems]
            itemAndChildren.forEach(i => {
                if (!isIndividuallySelected(i.targetId)) {
                    newItems.push({ targetType: i.targetType, targetId: i.targetId })
                }
            })
            onChange(newItems)
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
        const isInherited = !!groupSource || !!parentUnlockSource
        const isActive = selectedManually || isInherited
        
        // Tooltip o mensaje de estado
        let statusLabel = ""
        if (parentUnlockSource) statusLabel = `Acceso via ${parentUnlockSource}`
        else if (groupSource) statusLabel = `Asignado por Grupo: ${groupSource}`

        // Filtro de búsqueda
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const hasMatchingChild = item.children?.some(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.children?.some(sc => sc.name.toLowerCase().includes(search.toLowerCase())))

        if (search && !matchesSearch && !hasMatchingChild) return null

        return (
            <div key={item.id} className="select-none flex flex-col">
                <div 
                    className={`flex items-center gap-3 py-2 pr-4 transition-all border-b border-slate-50 last:border-0 ${
                        isInherited 
                            ? 'bg-blue-50/10 cursor-default' 
                            : 'hover:bg-slate-50 cursor-pointer'
                    } ${selectedManually ? 'bg-blue-50/30' : ''}`}
                    style={{ paddingLeft: `${depth * 24 + 16}px` }}
                    onClick={() => !isInherited && handleToggle(item)}
                >
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(item.id) }}
                        className={`p-1 hover:bg-slate-200 rounded-md transition-all text-slate-400 shrink-0 ${!hasChildren ? 'opacity-0 cursor-default' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                        {selectedManually ? (
                            <CheckSquare size={16} className="text-blue-600" />
                        ) : isInherited ? (
                            <div className="bg-blue-100 p-0.5 rounded-[4px]">
                                <ShieldCheck size={12} className="text-blue-600" />
                            </div>
                        ) : (
                            <Square size={16} className="text-slate-300" />
                        )}
                    </div>

                    <div className="shrink-0 flex items-center justify-center w-5">
                        {renderIcon(item.type)}
                    </div>
                    
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs truncate ${isActive ? 'font-black text-slate-900 tracking-tight' : 'text-slate-600 font-semibold'}`}>
                                {item.name}
                            </span>
                            {groupSource && (
                                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest">
                                    <Users size={10} />
                                    Grupo
                                </div>
                            )}
                        </div>
                    </div>

                    {statusLabel && (
                        <div className="shrink-0">
                            <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                                {statusLabel}
                            </span>
                        </div>
                    )}
                </div>

                {(isExpanded || (search && hasMatchingChild)) && item.children && (
                    <div className="flex flex-col">
                        {item.children.map(child => renderItem(child, depth + 1, [...path, item]))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar sección, categoría o elemento..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-300 focus:bg-white transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-4 shrink-0 text-right pr-2">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {selectedItems.length} Individuales
                        </p>
                        {inheritedPermissions.length > 0 && (
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                + {inheritedPermissions.length} Por Grupos
                            </p>
                        )}
                    </div>
                    <button 
                        type="button" 
                        onClick={() => onChange([])}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {alert && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <ShieldCheck className="text-amber-500" size={16} />
                    <p className="text-[10px] text-amber-800 font-bold uppercase leading-tight">
                        {alert.message}
                    </p>
                </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {hierarchy.length > 0 ? (
                        hierarchy.map(section => renderItem(section))
                    ) : (
                        <div className="py-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                                <Layers size={24} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargando Estructura...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
