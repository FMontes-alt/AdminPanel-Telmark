"use client"

import { motion } from "framer-motion"
import { Target, Layers } from "lucide-react"

interface QuestionsTabProps {
    stats: any
}

export default function QuestionsTab({ stats }: QuestionsTabProps) {
    return (
        <motion.div
            key="questions"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.questionStats.map((qs: any, index: number) => (
                    <div key={qs.id} className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col h-full">
                        <div className="flex justify-between items-start gap-4">
                            <span className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center text-xs font-black">
                                Q{index + 1}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                qs.successRate >= 70 ? 'bg-emerald-100 text-emerald-700' :
                                qs.successRate >= 40 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {qs.successRate}% Acierto
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed flex-1">
                            {qs.text}
                        </p>
                        <div className="pt-6 border-t border-slate-50 space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Correctas: {qs.correctCount}</span>
                                <span>Errores: {qs.wrongCount}</span>
                            </div>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${qs.successRate}%` }} />
                                <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${100 - qs.successRate}%` }} />
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 mt-2">
                            <Layers size={12} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{qs.topic}</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
