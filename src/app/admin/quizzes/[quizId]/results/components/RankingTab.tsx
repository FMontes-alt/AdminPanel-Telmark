"use client"

import { motion, AnimatePresence } from "framer-motion"
import { User as UserIcon, History, X, Calendar, Target, Trophy } from "lucide-react"
import { useState } from "react"

interface RankingTabProps {
    stats: any
}

export default function RankingTab({ stats }: RankingTabProps) {
    const [selectedUser, setSelectedUser] = useState<any>(null)

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
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Historial</th>
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
                                <td className="px-10 py-6 text-right">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all group/btn"
                                    >
                                        <History size={12} className="group-hover/btn:rotate-[-45deg] transition-transform" />
                                        <span>Ver {user.history?.length || 0}</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Historial */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl border border-slate-100 w-full max-w-lg relative overflow-hidden"
                        >
                            {/* Header Modal */}
                            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">Historial de Intentos</h3>
                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                                        <UserIcon size={12} /> {selectedUser.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 hover:bg-slate-200 text-slate-400 rounded-xl transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Listado de Intentos */}
                            <div className="p-8 max-h-[400px] overflow-y-auto space-y-4">
                                {selectedUser.history.map((h: any, i: number) => (
                                    <div 
                                        key={h.id}
                                        className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                                            i === 0 ? "bg-blue-50/50 border-blue-100" : "bg-white border-slate-50 shadow-sm"
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                                    {new Date(h.date).toLocaleDateString('es-ES', {
                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold">
                                                {new Date(h.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • ID: {h.id.slice(0, 8)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <Trophy size={11} className={i === 0 ? "text-amber-500" : "text-slate-300"} />
                                                    <span className="text-sm font-black text-slate-900">{h.score} / {h.maxScore}</span>
                                                </div>
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Target size={11} className="text-slate-300" />
                                                    <span className={`text-[10px] font-black uppercase ${
                                                        h.percentage >= 80 ? 'text-emerald-500' : 
                                                        h.percentage >= 50 ? 'text-blue-500' : 
                                                        'text-red-500'
                                                    }`}>
                                                        {h.percentage}% éxito
                                                    </span>
                                                </div>
                                            </div>
                                            {i === 0 && (
                                                <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-lg tracking-widest">
                                                    Mejor
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Modal */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total de intentos</p>
                                <p className="text-2xl font-black text-blue-600">{selectedUser.history.length}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
