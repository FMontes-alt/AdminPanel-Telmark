"use client"

import { Pencil, Trash2, Mail, Phone, ChevronRight } from "lucide-react"

interface AgentsListProps {
    agents: any[];
    sections: any[];
    onEdit: (agent: any) => void;
    onDelete: (id: string) => void;
}

export function AgentsList({ agents, sections, onEdit, onDelete }: AgentsListProps) {
    const getSectionNames = (ids: string[]) => {
        if (!ids || ids.length === 0) return "Sin secciones"
        return sections
            .filter(s => ids.includes(s.id))
            .map(s => s.name)
            .join(", ")
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {agents.map((agent) => (
                <div 
                    key={agent.id}
                    className="bg-white border border-slate-100 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all font-black uppercase">
                            {agent.firstName?.[0]}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900 leading-none">{agent.firstName} {agent.lastName}</h3>
                            <div className="flex gap-x-4 text-slate-400 text-[11px] font-bold">
                                <span className="flex items-center gap-1.5"><Mail size={12}/> {agent.email}</span>
                                {agent.phone && <span className="flex items-center gap-1.5"><Phone size={12}/> {agent.phone}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Secciones</p>
                            <p className="text-xs font-bold text-slate-600 truncate max-w-[200px]">
                                {getSectionNames(agent.assignedSectionIds)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onEdit(agent)} 
                                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={() => onDelete(agent.id)} 
                                className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
