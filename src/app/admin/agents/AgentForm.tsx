"use client"

import { useState } from "react"
import { createAgent, updateAgent } from "@/actions/users"
import { X, Save, Loader2, User, Mail, Phone, Lock } from "lucide-react"

interface AgentFormProps {
    agent?: any;
    sections: any[];
    onClose: () => void;
    onSuccess: () => void;
}

export function AgentForm({ agent, sections, onClose, onSuccess }: AgentFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        email: agent?.email || "",
        firstName: agent?.firstName || "",
        lastName: agent?.lastName || "",
        phone: agent?.phone || "",
        role: agent?.role || "usuario",
        assignedSectionIds: agent?.assignedSectionIds || [] as string[],
        password: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            let result;
            if (agent) {
                result = await updateAgent(agent.id, {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    role: formData.role,
                    assignedSectionIds: formData.assignedSectionIds,
                })
            } else {
                result = await createAgent(formData)
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

    const toggleSection = (id: string) => {
        setFormData(prev => ({
            ...prev,
            assignedSectionIds: prev.assignedSectionIds.includes(id)
                ? prev.assignedSectionIds.filter((sId: string) => sId !== id)
                : [...prev.assignedSectionIds, id]
        }))
    }

    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-2xl space-y-8 max-w-2xl w-full mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                        {agent ? "Editar Empleado" : "Nuevo Empleado"}
                    </h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre</label>
                        <input
                            required
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none transition-all border"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Apellidos</label>
                        <input
                            required
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none transition-all border"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                    <input
                        required
                        type="email"
                        disabled={!!agent}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none transition-all border disabled:opacity-50"
                    />
                </div>

                <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Secciones Asignadas</label>
                    <div className="grid grid-cols-2 gap-3">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => toggleSection(section.id)}
                                className={`p-3 rounded-2xl border text-left transition-all ${formData.assignedSectionIds.includes(section.id)
                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                                    }`}
                            >
                                <p className="text-[10px] font-black truncate uppercase tracking-tight">{section.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                <Save size={18} />
                                {agent ? "Guardar" : "Crear"}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 bg-slate-100 text-slate-500 rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}