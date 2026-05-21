import { FolderTree } from "lucide-react"

interface AgentGroupSelectorProps {
    groups: any[];
    groupIds: string[];
    toggleGroup: (id: string) => void;
}

export function AgentGroupSelector({ groups, groupIds, toggleGroup }: AgentGroupSelectorProps) {
    if (groups.length === 0) {
        return (
            <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    <FolderTree size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase">No hay grupos creados</p>
                <p className="text-xs text-slate-400">Crea grupos en la sección de Grupos del panel.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {groups.map(group => (
                <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`p-5 rounded-3xl border text-left transition-all flex items-center gap-4 ${
                        groupIds.includes(group.id)
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                    }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${groupIds.includes(group.id) ? "bg-white/20" : "bg-slate-50"}`}>
                        <FolderTree size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight truncate">{group.name}</p>
                        <p className={`text-[10px] truncate ${groupIds.includes(group.id) ? "text-blue-100" : "text-slate-400"}`}>
                            {group.description || "Sin descripción"}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    )
}
