"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp } from "lucide-react"

interface TopicsTabProps {
    stats: any
}

function AlertCircle({ size, className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}

export default function TopicsTab({ stats }: TopicsTabProps) {
    return (
        <motion.div
            key="topics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
            {stats.topicStats.map((ts: any) => (
                <div key={ts.topic} className="bg-white rounded-[40px] border border-slate-100 p-10 flex flex-col gap-8 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{ts.topic}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{ts.questionCount} preguntas en este tema</p>
                        </div>
                        <div className={`w-20 h-20 rounded-full border-8 flex items-center justify-center
                            ${ts.avgSuccessRate >= 80 ? 'border-emerald-50 text-emerald-600' : 
                              ts.avgSuccessRate >= 50 ? 'border-blue-50 text-blue-600' : 
                              'border-red-50 text-red-600'}`}
                        >
                            <span className="text-xl font-black">{ts.avgSuccessRate}%</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de asimilación</h4>
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                            {ts.avgSuccessRate >= 80 ? (
                                <>
                                    <TrendingUp className="text-emerald-500" size={32} />
                                    <p className="text-sm font-medium text-slate-600">Este tema ha sido asimilado correctamente por la mayoría. No requiere intervención inmediata.</p>
                                </>
                            ) : ts.avgSuccessRate >= 50 ? (
                                <>
                                    <AlertCircle className="text-blue-500" size={32} />
                                    <p className="text-sm font-medium text-slate-600">Rendimiento aceptable, pero hay lagunas detectadas. Se recomienda refuerzo ligero.</p>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="text-red-500" size={32} />
                                    <p className="text-sm font-medium text-slate-600">Rendimiento crítico. El contenido o la explicación de este tema no está siendo comprendido.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    )
}
