"use client"

import { motion } from "framer-motion"
import { User as UserIcon } from "lucide-react"

interface RankingTabProps {
    stats: any
}

export default function RankingTab({ stats }: RankingTabProps) {
    return (
        <motion.div
            key="ranking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden"
        >
            <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clasificación de Usuarios</h2>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Listado completo según rendimiento
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 text-left">
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Posición</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Precisión</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Puntos</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.userRanking.map((user: any) => (
                            <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all group">
                                <td className="px-10 py-6">
                                    <span className={`text-lg font-black ${user.rank <= 3 ? 'text-blue-600' : 'text-slate-300'}`}>
                                        #{user.rank.toString().padStart(2, '0')}
                                    </span>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <UserIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">{user.name}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        user.percentage >= 80 ? 'bg-emerald-50 text-emerald-600' : 
                                        user.percentage >= 50 ? 'bg-blue-50 text-blue-600' : 
                                        'bg-red-50 text-red-600'
                                    }`}>
                                        {user.percentage}% éxito
                                    </span>
                                </td>
                                <td className="px-10 py-6 text-center font-black text-slate-700">
                                    {user.score} / {user.maxScore}
                                </td>
                                <td className="px-10 py-6 text-right text-xs text-slate-400 font-bold">
                                    {new Date(user.date).toLocaleDateString('es-ES', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}
