"use client"

import { motion } from "framer-motion"
import { Target, TrendingUp, Users, CheckCircle2, XCircle } from "lucide-react"
import StatCard from "./StatCard"

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
        >
            <div className="space-y-6">
                {/* Performance by Topic (Top) */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm h-fit">
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

                {/* Global Stats Grid (Bottom) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-fit pt-6">
                    <StatCard 
                        label="Puntuación Media" 
                        value={`${stats.overallSuccessRate}%`} 
                        icon={TrendingUp} 
                        color="blue"
                        description="Rendimiento global de todos los usuarios"
                    />
                    <StatCard 
                        label="Participación" 
                        value={stats.uniqueUsersCount} 
                        icon={Users} 
                        color="purple"
                        description="Usuarios únicos"
                    />
                    <StatCard 
                        label="Tema más fuerte" 
                        value={stats.topicStats[stats.topicStats.length - 1]?.topic || "N/A"} 
                        icon={CheckCircle2} 
                        color="emerald"
                        description={`${stats.topicStats[stats.topicStats.length - 1]?.avgSuccessRate || 0}% de éxito`}
                    />
                    <StatCard 
                        label="Punto Crítico" 
                        value={stats.topicStats[0]?.avgSuccessRate < 100 ? (stats.topicStats[0]?.topic || "General") : "Ninguno"} 
                        icon={XCircle} 
                        color={stats.topicStats[0]?.avgSuccessRate < 100 ? "red" : "emerald"}
                        description={stats.topicStats[0]?.avgSuccessRate < 100 ? "Requiere refuerzo" : "Todo dominado"}
                        danger={stats.topicStats[0]?.avgSuccessRate < 60}
                    />
                </div>
            </div>
        </motion.div>
    )
}
