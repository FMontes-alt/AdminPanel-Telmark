"use client"

import { motion } from "framer-motion"
import { Trophy, TrendingUp, Target, ChevronRight } from "lucide-react"

interface OverviewTabProps {
    stats: any
    onSeeAllRanking: () => void
}

export default function OverviewTab({ stats, onSeeAllRanking }: OverviewTabProps) {
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Performance by Topic */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Target className="text-blue-500" /> Rendimiento por Campo
                    </h2>
                    <div className="space-y-6">
                        {stats.topicStats.map((ts: any) => (
                            <div key={ts.topic} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-700">{ts.topic}</span>
                                    <span className={`text-sm font-black ${ts.avgSuccessRate >= 80 ? 'text-emerald-500' : ts.avgSuccessRate >= 50 ? 'text-blue-500' : 'text-red-500'}`}>
                                        {ts.avgSuccessRate}%
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ts.avgSuccessRate}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${ts.avgSuccessRate >= 80 ? 'bg-emerald-500' : ts.avgSuccessRate >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers Card */}
                <div className="bg-slate-900 rounded-[40px] p-10 space-y-8 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-175 transition-transform duration-1000">
                        <Trophy size={160} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 relative z-10">
                        <TrendingUp className="text-blue-400" /> Los más destacados
                    </h2>
                    <div className="space-y-4 relative z-10">
                        {stats.userRanking.slice(0, 3).map((user: any, index: number) => (
                            <div key={user.id} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                                        ${index === 0 ? 'bg-amber-400 text-slate-900' : 
                                          index === 1 ? 'bg-slate-300 text-slate-900' : 
                                          'bg-orange-400 text-slate-900'}`}
                                    >
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{user.name}</p>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{user.percentage}% - Completado</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-white/20" />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onSeeAllRanking}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                    >
                        Ver Clasificación Completa
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
