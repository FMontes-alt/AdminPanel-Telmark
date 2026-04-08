"use client"

import { useState } from "react"
import { createAgent, updateAgent } from "@/actions/users"
import { X, Save, Loader2, User, Mail, Phone, Lock, ShieldCheck, FolderTree, Info } from "lucide-react"
import { PermissionSelector } from "../components/PermissionSelector"

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
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Apellidos</label>
                                <input
                                    required
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        required
                                        type="email"
                                        disabled={!!agent}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {!agent && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Contraseña Inicial</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="password"
                                        placeholder="Dejar vacío para usar defecto: Telmark2026!"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nivel de Acceso</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "usuario", label: "Usuario Base", icon: User },
                                    { id: "admin", label: "Administrador", icon: ShieldCheck },
                                    { id: "superadmin", label: "Super Admin", icon: Lock },
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r.id })}
                                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                                            formData.role === r.id
                                                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                        }`}
                                    >
                                        <r.icon size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: Grupos */}
                {activeTab === "groups" && (
                    <div className="space-y-6">
                        {groups.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                    <FolderTree size={32} />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase">No hay grupos creados</p>
                                <p className="text-xs text-slate-400">Crea grupos en la sección de Grupos del panel.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {groups.map(group => (
                                    <button
                                        key={group.id}
                                        type="button"
                                        onClick={() => toggleGroup(group.id)}
                                        className={`p-5 rounded-3xl border text-left transition-all flex items-center gap-4 ${
                                            formData.groupIds.includes(group.id)
                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.groupIds.includes(group.id) ? "bg-white/20" : "bg-slate-50"}`}>
                                            <FolderTree size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black uppercase tracking-tight truncate">{group.name}</p>
                                            <p className={`text-[10px] truncate ${formData.groupIds.includes(group.id) ? "text-blue-100" : "text-slate-400"}`}>
                                                {group.description || "Sin descripción"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Permisos */}
                {activeTab === "permissions" && (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                            <Info className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Los permisos aquí son <strong>adicionales y específicos</strong> para este usuario. También heredará los permisos de los grupos a los que pertenezca.
                            </p>
                        </div>
                        <PermissionSelector
                            hierarchy={hierarchy}
                            selectedItems={formData.permissionItems}
                            onChange={(items) => setFormData({ ...formData, permissionItems: items })}
                        />
                    </div>
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