import { ArrowUpRight, ShieldCheck, Zap, Calendar, MoreHorizontal } from "lucide-react"
import Link from "next/link"

interface Campaign {
    id: string
    name: string
    slug: string
    created_at: string
}

interface RecentCampaignsListProps {
    sections: Campaign[]
}

export function RecentCampaignsList({ sections }: RecentCampaignsListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Campañas Recientes</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimas actualizaciones en la red</p>
                </div>
                <Link href="/admin/sections">
                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-all group">
                        Ver todo <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </Link>
            </div>

            <div className="space-y-3">
                {sections.map((section) => (
                    <div 
                        key={section.id} 
                        className="group flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm group-hover:shadow-md">
                                {section.name.toLowerCase().includes('salud') || section.name.toLowerCase().includes('adeslas') ? <ShieldCheck size={28} /> : <Zap size={28} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{section.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-black uppercase tracking-widest">Activa</span>
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                        <Calendar size={10} /> {new Date(section.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/sections/${section.slug}`}>
                                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                    <ArrowUpRight size={18} />
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}

                {(!sections || sections.length === 0) && (
                    <div className="py-20 text-center opacity-30">
                        <Zap size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay campañas recientes</p>
                    </div>
                )}
            </div>
        </div>
    )
}
