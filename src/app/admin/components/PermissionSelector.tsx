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
            <div key={item.id} className="select-none">
                <div 
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl transition-all ${
                        isInherited 
                            ? 'bg-blue-50/20 grayscale-[0.2] cursor-default opacity-80' 
                            : 'hover:bg-slate-50 cursor-pointer'
                    } ${selectedManually ? 'bg-blue-50/40' : ''}`}
                    style={{ marginLeft: `${depth * 20}px` }}
                >
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(item.id) }}
                        className={`p-1 hover:bg-slate-200 rounded-md transition-all ${!hasChildren ? 'invisible' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <div 
                        onClick={() => !isInherited && handleToggle(item)} 
                        className={`flex items-center gap-2 flex-1 min-w-0 ${isInherited ? 'pointer-events-none' : ''}`}
                    >
                        <div className="relative flex items-center justify-center w-5 h-5">
                            {selectedManually ? (
                                <CheckSquare size={16} className="text-blue-600" />
                            ) : isInherited ? (
                                <div className="bg-blue-600/10 p-1 rounded-md">
                                    <ShieldCheck size={12} className="text-blue-600" />
                                </div>
                            ) : (
                                <Square size={16} className="text-slate-300" />
                            )}
                        </div>

                        {renderIcon(item.type)}
                        
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-[11px] truncate ${isActive ? 'font-black text-blue-900 uppercase tracking-tight' : 'text-slate-500 font-bold'}`}>
                                    {item.name}
                                </span>
                                {groupSource && (
                                    <div className="flex items-center gap-1 bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest shadow-sm shadow-blue-500/10">
                                        <Users size={8} />
                                        Equipo
                                    </div>
                                )}
                            </div>
                            {statusLabel && (
                                <span className="text-[7px] text-blue-400 font-black uppercase tracking-[0.1em] leading-none mt-0.5 opacity-70">
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

            {alert && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <ShieldCheck className="text-amber-500" size={16} />
                    <p className="text-[10px] text-amber-800 font-bold uppercase leading-tight selection:bg-amber-200">
                        {alert.message}
                    </p>
                </div>
            )}

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
