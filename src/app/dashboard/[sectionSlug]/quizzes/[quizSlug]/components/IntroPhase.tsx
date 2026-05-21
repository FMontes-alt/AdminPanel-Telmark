"use client"

import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft } from "lucide-react"

interface IntroPhaseProps {
    quiz: any
    questionsCount: number
    onStart: () => void
    onBack: () => void
}

export default function IntroPhase({ 
    quiz, 
    questionsCount, 
    onStart, 
    onBack
}: IntroPhaseProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg w-full bg-white rounded-[36px] shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white text-center">
                    <h1 className="text-2xl font-black tracking-tight">{quiz.title}</h1>
                    {quiz.description && <p className="text-blue-200 text-sm mt-2">{quiz.description}</p>}
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-slate-900">{questionsCount}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preguntas</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-slate-900">
                                {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "∞"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiempo</p>
                        </div>
                    </div>

                    <button
                        onClick={onStart}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        Comenzar Cuestionario
                        <ArrowRight size={16} />
                    </button>

                    <button
                        onClick={onBack}
                        className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={14} /> Volver
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
