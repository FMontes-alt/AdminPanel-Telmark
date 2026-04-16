"use client"

import { useState } from "react"
import { upsertGroup } from "@/actions/groups"
import { X, Save, Loader2, FolderTree, Info, Search, User } from "lucide-react"
import { PermissionSelector } from "../components/PermissionSelector"

interface GroupFormProps {
    group?: any;
    users: any[];
    hierarchy: any[];
    onClose: () => void;
    onSuccess: () => void;
}

export function GroupForm({ group, users, hierarchy, onClose, onSuccess }: GroupFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"general" | "permissions" | "members">("general")
    const [userSearch, setUserSearch] = useState("")

    const [formData, setFormData] = useState({
        name: group?.name || "",
        description: group?.description || "",
        memberIds: (group?.members || []).map((m: any) => m.userId) as string[],
        permissionItems: (group?.permissions || []).map((p: any) => ({
            targetType: p.targetType as "section" | "category" | "subcategory" | "item",
            targetId: p.targetId as string
        })),
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = await upsertGroup({
                id: group?.id,
                ...formData
            })

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

    const toggleMember = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            memberIds: prev.memberIds.includes(userId)
                ? prev.memberIds.filter(id => id !== userId)
                : [...prev.memberIds, userId]
        }))
    }

    const filteredUsers = users.filter(u => 
        u.firstName.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    )

    return (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden max-w-4xl w-full mx-auto flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-8 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <FolderTree size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter lead-none">
                            {group ? "Editar Grupo" : "Nuevo Grupo"}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración de miembros y permisos masivos</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400">
                    <X size={20} />
                </button>
            </div>

            <div className="flex border-b border-slate-100 px-8">
                <button 
                    onClick={() => setActiveTab("general")}
                    className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Información Básica
                </button>
                <button 
                    onClick={() => setActiveTab("members")}
                    className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Miembros ({formData.memberIds.length})
                </button>
                <button 
                    onClick={() => setActiveTab("permissions")}
                    className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Permisos del Grupo
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {activeTab === "general" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre del Grupo</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none transition-all border"
                                placeholder="Ej: Equipo de Ventas ADESLAS"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none transition-all border min-h-[120px]"
                                placeholder="Describe el propósito de este grupo..."
                            />
                        </div>
                    </div>
                )}

                {activeTab === "members" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Buscar usuarios para añadir..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-200 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                            {filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => toggleMember(user.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${formData.memberIds.includes(user.id)
                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                                        : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase ${formData.memberIds.includes(user.id) ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                                        {user.firstName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black truncate leading-tight">{user.firstName} {user.lastName}</p>
                                        <p className={`text-[9px] truncate ${formData.memberIds.includes(user.id) ? 'text-blue-100' : 'text-slate-400'}`}>{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "permissions" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-4 items-start">
                            <Info className="text-amber-500 mt-1 flex-shrink-0" size={16} />
                            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                Los permisos asignados al grupo se aplican a <strong>todos sus miembros</strong>. Si seleccionas una sección, el acceso incluirá automáticamente todas sus categorías e ítems.
                            </p>
                        </div>
                        <PermissionSelector 
                            hierarchy={hierarchy}
                            selectedItems={formData.permissionItems}
                            inheritedPermissions={[]}
                            onChange={(items) => setFormData({ ...formData, permissionItems: items })}
                        />
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}
            </form>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                            <Save size={18} />
                            {group ? "Guardar Cambios" : "Crear Grupo"}
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
