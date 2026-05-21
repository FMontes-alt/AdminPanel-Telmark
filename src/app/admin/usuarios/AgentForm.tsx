"use client"

import { useState, useEffect } from "react"
import { createAgent, updateAgent } from "@/actions/users"
import { X, Save, Loader2, User } from "lucide-react"
import { AgentBasicFields } from "./AgentBasicFields"
import { AgentGroupSelector } from "./AgentGroupSelector"
import { AgentPermissions } from "./AgentPermissions"

interface AgentFormProps {
    agent?: any;
    sections: any[];
    groups: any[];
    hierarchy: any[];
    onClose: () => void;
    onSuccess: () => void;
}

export function AgentForm({ agent, sections, groups, hierarchy, onClose, onSuccess }: AgentFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"general" | "permissions" | "groups">("general")

    const [formData, setFormData] = useState({
        email: agent?.email || "",
        firstName: agent?.firstName || "",
        lastName: agent?.lastName || "",
        phone: agent?.phone || "",
        role: agent?.role || "usuario",
        groupIds: (agent?.groupIds || []) as string[],
        permissionItems: (agent?.permissions || []).map((p: any) => ({
            targetType: p.targetType,
            targetId: p.targetId
        })) as { targetType: string, targetId: string }[],
        inheritedPermissions: (agent?.inheritedPermissions || []).map((p: any) => ({
            targetType: p.targetType,
            targetId: p.targetId,
            sourceName: p.sourceName
        })) as { targetType: string, targetId: string, sourceName: string }[],
        password: "",
    })

    const handleSave = async () => {
        setLoading(true)
        setError(null)

        try {
            let result;
            if (agent) {
                result = await updateAgent(agent.id, {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    role: formData.role as any,
                    groupIds: formData.groupIds,
                    permissionItems: formData.permissionItems as any,
                })
            } else {
                result = await createAgent({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    role: formData.role as any,
                    groupIds: formData.groupIds,
                    permissionItems: formData.permissionItems as any,
                    password: formData.password || undefined,
                })
            }

            if (result.success) {
                onSuccess()
            } else {
                setError(result.error || "Ocurrió un error inesperado")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleGroup = (id: string) => {
        setFormData(prev => ({
            ...prev,
            groupIds: prev.groupIds.includes(id)
                ? prev.groupIds.filter(gId => gId !== id)
                : [...prev.groupIds, id]
        }))
    }

    useEffect(() => {
        // Recalcular permisos heredados cuando cambian los grupos seleccionados
        const newInherited: any[] = []
        formData.groupIds.forEach(gId => {
            const group = groups.find(g => g.id === gId)
            if (group && group.permissions) {
                group.permissions.forEach((p: any) => {
                    newInherited.push({
                        targetType: p.targetType,
                        targetId: p.targetId,
                        sourceName: group.name
                    })
                })
            }
        })
        setFormData(prev => ({ ...prev, inheritedPermissions: newInherited }))
    }, [formData.groupIds, groups])

    return (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden max-w-4xl w-full mx-auto flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-8 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                            {agent ? "Editar Usuario" : "Nuevo Usuario"}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración de acceso y perfil</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400">
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-8">
                {[
                    { id: "general", label: "Información General" },
                    { id: "groups", label: "Grupos" },
                    { id: "permissions", label: "Permisos Especiales" },
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* TAB: General */}
                {activeTab === "general" && (
                    <AgentBasicFields 
                        formData={formData} 
                        setFormData={setFormData} 
                        isEditing={!!agent} 
                    />
                )}

                {/* TAB: Grupos */}
                {activeTab === "groups" && (
                    <AgentGroupSelector 
                        groups={groups} 
                        groupIds={formData.groupIds} 
                        toggleGroup={toggleGroup} 
                    />
                )}

                {/* TAB: Permisos */}
                {activeTab === "permissions" && (
                    <AgentPermissions 
                        hierarchy={hierarchy} 
                        permissionItems={formData.permissionItems} 
                        inheritedPermissions={formData.inheritedPermissions} 
                        onChange={(items) => setFormData({ ...formData, permissionItems: items })} 
                    />
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                            <Save size={18} />
                            {agent ? "Guardar Cambios" : "Crear Usuario"}
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="px-8 bg-white border border-slate-200 text-slate-500 rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                >
                    Cancelar
                </button>
            </div>
        </div>
    )
}