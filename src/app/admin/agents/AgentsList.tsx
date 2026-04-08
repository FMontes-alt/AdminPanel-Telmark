"use client"

import { Pencil, Trash2, Mail, Phone, Shield, User, Star } from "lucide-react"

interface AgentsListProps {
    agents: any[];
    sections: any[];
    onEdit: (agent: any) => void;
    onDelete: (id: string) => void;
}

export function AgentsList({ agents, sections, onEdit, onDelete }: AgentsListProps) {
    const roles = ["superadmin", "admin", "usuario"]

    const getSectionNames = (ids: string[]) => {
        if (!ids || ids.length === 0) return "Sin secciones"
        return sections
            .filter(s => ids.includes(s.id))
            .map(s => s.name)
            .join(", ")
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "superadmin": return <Star size={14} className="text-amber-500" />
            case "admin": return <Shield size={14} className="text-blue-500" />
            default: return <User size={14} className="text-slate-400" />
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "superadmin": return "Super Administrador"
            case "admin": return "Administrador"
            default: return "Empleado / Usuario"
        }
    }

    return (
        <div className="space-y-12">
            {roles.map((role) => {
                const filteredAgents = agents.filter(a => a.role === role)
                if (filteredAgents.length === 0) return null

                return (
                    <div key={role} className="space-y-4">
                        <div className="flex items-center gap-3 px-6">
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                {getRoleIcon(role)}
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                                {getRoleLabel(role)} <span className="text-slate-200 ml-2">({filteredAgents.length})</span>
                            </h2>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-300">Usuario</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-300">Contacto</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-300">Accesos</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-300">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAgents.map((agent) => (
                                        <tr key={agent.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black uppercase text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {agent.firstName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-900 leading-none">{agent.firstName} {agent.lastName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{agent.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                                                        <Mail size={12} className="text-slate-300" /> {agent.email}
                                                    </div>
                                                    {agent.phone && (
                                                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                                                            <Phone size={12} className="text-slate-300" /> {agent.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg tracking-tight">
                                                        Configurado
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => onEdit(agent)}
                                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onDelete(agent.id)}
                                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
