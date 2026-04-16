"use client"

import { motion } from "framer-motion"
import { Trophy, CheckCircle2, XCircle, RotateCcw, ChevronLeft, ArrowLeft } from "lucide-react"

interface PersonalResultsProps {
    results: any
    onRepeat: () => void
    onBackToQuizzes: () => void
}

export default function PersonalResults({ results, onRepeat, onBackToQuizzes }: PersonalResultsProps) {
    const attempt = results.attempt
    const percentage = attempt?.maxScore ? Math.round((attempt.score / attempt.maxScore) * 100) : 0
    const details = results.details?.questions || []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 py-12">
            <div className="max-w-2xl mx-auto space-y-8">
                <button
                    onClick={onBackToQuizzes}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Volver a Cuestionarios
                </button>

                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[36px] shadow-xl border border-slate-100 overflow-hidden text-center"
                >
                    <div className={`p-8 ${
                        attempt?.status === "pending_review" ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                        percentage >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 
                        percentage >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                        'bg-gradient-to-r from-red-500 to-red-600'
                    } text-white`}>
                        <Trophy size={40} className="mx-auto mb-3 opacity-80" />
                        <p className="text-5xl font-black">{attempt?.status === "pending_review" ? "??%" : `${percentage}%`}</p>
                        <p className="text-sm opacity-80 mt-1">
                            {attempt?.status === "pending_review" ? "Nota calculada tras revisión" : `${attempt?.score} de ${attempt?.maxScore} puntos`}
                        </p>
                    </div>
                    <div className="p-6">
                        <p className="text-lg font-black text-slate-900">
                            {attempt?.status === "pending_review" ? "Cuestionario en revisión" :
                             percentage >= 70 ? "¡Excelente trabajo!" : 
                             percentage >= 40 ? "Buen intento" : 
                             "Sigue practicando"}
                        </p>
                        {attempt?.status === "pending_review" && (
                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                El administrador está revisando tus respuestas abiertas. <br/>
                                Vuelve más tarde para ver tu nota final.
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Question Review */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Revisión de Respuestas</h3>
                    {details.map((q: any, i: number) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-black text-slate-500 flex-shrink-0">
                                    {i + 1}
                                </span>
                                <p className="text-sm font-bold text-slate-800 flex-1">{q.text}</p>
                                {q.userAnswer?.isCorrect === true && <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />}
                                {q.userAnswer?.isCorrect === false && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
                                {q.userAnswer?.isCorrect === null && (
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                                        Pendiente
                                    </span>
                                )}
                            </div>
                            {q.options && q.options.length > 0 && (
                                <div className="ml-10 space-y-1.5">
                                    {q.options.map((opt: any) => {
                                        const userSelected = (q.userAnswer?.selectedOptions || []).includes(opt.id)
                                        return (
                                            <div
                                                key={opt.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                                    opt.isCorrect ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : userSelected ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-slate-50 text-slate-400"
                                                }`}
                                            >
                                                {opt.isCorrect && <CheckCircle2 size={12} className="text-emerald-500" />}
                                                {!opt.isCorrect && userSelected && <XCircle size={12} className="text-red-500" />}
                                                {opt.text}
                                                {userSelected && !opt.isCorrect && <span className="ml-auto text-[9px] font-black uppercase">Tu respuesta</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onRepeat}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <RotateCcw size={16} /> Repetir
                    </button>
                    <button
                        onClick={onBackToQuizzes}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={16} /> Volver a Cuestionarios
                    </button>
                </div>
            </div>
        </div>
    )
}
