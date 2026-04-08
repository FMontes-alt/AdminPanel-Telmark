"use client"

import { Pencil, Trash2, Users, FolderTree, ArrowRight } from "lucide-react"

interface GroupsListProps {
    groups: any[];
    onEdit: (group: any) => void;
    onDelete: (id: string) => void;
}

export function GroupsList({ groups, onEdit, onDelete }: GroupsListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
                <div 
                    key={group.id} 
                    className="group bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 transition-all space-y-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors" />
                    
                    <div className="flex items-start justify-between relative">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <FolderTree size={24} />
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onEdit(group)}
                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={() => onDelete(group.id)}
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{group.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                            {group.description || "Aún no hay una descripción definida para este grupo de gestión."}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                                        {i === 3 ? "+" : "U"}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Usuarios Activos</span>
                        </div>
                        <button 
                            onClick={() => onEdit(group)}
                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
