"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, User, Clock, ChevronRight, MessageSquare, AlertCircle } from "lucide-react"
import { getPendingReviews, gradeShortAnswerAction, getAttemptResults } from "@/actions/quiz-attempts"

interface ReviewTabProps {
    quizId: string
    onGrated?: () => void
}

export default function ReviewTab({ quizId, onGrated }: ReviewTabProps) {
    const [pendingAttempts, setPendingAttempts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null)
    const [grading, setGrading] = useState<string | null>(null)

    const fetchPending = async () => {
        setLoading(true)
        const data = await getPendingReviews(quizId)
        setPendingAttempts(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchPending()
    }, [quizId])

    const handleSelectAttempt = async (attempt: any) => {
        const fullResults = await getAttemptResults(attempt.id)
        if (fullResults) {
            setSelectedAttempt({
                ...attempt,
                questions: fullResults.questions.filter((q: any) => q.type === "short_answer" && q.userAnswer?.isCorrect === null)
            })
        }
    }

    const handleGrade = async (answerId: string, isCorrect: boolean) => {
        setGrading(answerId)
        const result = await gradeShortAnswerAction(answerId, isCorrect)
        if (result.success) {
            // Update local state
            if (selectedAttempt) {
                const remaining = selectedAttempt.questions.filter((q: any) => q.userAnswer.id !== answerId)
                if (remaining.length === 0) {
                    setSelectedAttempt(null)
                    fetchPending()
                    if (onGrated) onGrated()
                } else {
                    setSelectedAttempt({ ...selectedAttempt, questions: remaining })
                }
            }
        }
        setGrading(null)
    }

    if (loading && pendingAttempts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando revisiones...</p>
            </div>
        )
    }

    if (pendingAttempts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-[22px] flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Todo al día</h3>
                <p className="text-sm text-slate-400 mt-1">No hay respuestas pendientes de revisión.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List of Pending Attempts */}
            <div className="lg:col-span-4 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <AlertCircle size={12} className="text-amber-500" />
                    Intentos por Calificar ({pendingAttempts.length})
                </h3>
                <div className="space-y-3">
                    {pendingAttempts.map((attempt) => (
                        <button
                            key={attempt.id}
                            onClick={() => handleSelectAttempt(attempt)}
                            className={`w-full text-left p-5 rounded-[24px] border transition-all group ${
                                selectedAttempt?.id === attempt.id 
                                    ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20" 
                                    : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    selectedAttempt?.id === attempt.id ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400"
                                }`}>
                                    <User size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black truncate ${selectedAttempt?.id === attempt.id ? "text-white" : "text-slate-900"}`}>
                                        {attempt.firstName || attempt.lastName 
                                            ? `${attempt.firstName || ""} ${attempt.lastName || ""}`.trim() 
                                            : "Sin nombre"}
                                    </p>
                                    <p className={`text-[10px] font-bold truncate ${selectedAttempt?.id === attempt.id ? "text-blue-100" : "text-slate-400"}`}>
                                        {attempt.email}
                                    </p>
                                    <p className={`text-[9px] font-medium mt-1 uppercase tracking-tight ${selectedAttempt?.id === attempt.id ? "text-blue-100/60" : "text-slate-300"}`}>
                                        {new Date(attempt.completedAt).toLocaleDateString()} · {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <ChevronRight size={16} className={selectedAttempt?.id === attempt.id ? "text-white" : "text-slate-200 group-hover:text-blue-400"} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grading Area */}
            <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                    {selectedAttempt ? (
                        <motion.div
                            key={selectedAttempt.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
                        >
                            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={18} className="text-blue-500" />
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Revision de Respuestas</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-900 uppercase">
                                        {selectedAttempt.firstName ? `${selectedAttempt.firstName} ${selectedAttempt.lastName || ""}` : "Usuario"}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400">{selectedAttempt.email}</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-10">
                                {selectedAttempt.questions?.map((q: any, i: number) => (
                                    <div key={q.id} className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0">
                                                {i + 1}
                                            </span>
                                            <div className="space-y-4 flex-1">
                                                <p className="text-base font-bold text-slate-800 leading-relaxed">{q.text}</p>
                                                
                                                {/* Comparison Box */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-slate-50 rounded-2xl p-5 space-y-2 border border-slate-100">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Respuesta del Alumno</p>
                                                        <p className="text-sm font-medium text-slate-700 italic">"{q.userAnswer.textAnswer || "(Vacío)"}"</p>
                                                    </div>
                                                    <div className="bg-blue-50/50 rounded-2xl p-5 space-y-2 border border-blue-100/50">
                                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Referencia Esperada</p>
                                                        <p className="text-sm font-bold text-blue-800">
                                                            {q.options?.[0]?.text || "No se especificó referencia"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Grading Buttons */}
                                                <div className="flex gap-3 pt-2">
                                                    <button
                                                        onClick={() => handleGrade(q.userAnswer.id, true)}
                                                        disabled={grading === q.userAnswer.id}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                        Correcta
                                                    </button>
                                                    <button
                                                        onClick={() => handleGrade(q.userAnswer.id, false)}
                                                        disabled={grading === q.userAnswer.id}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                                                    >
                                                        <XCircle size={16} />
                                                        Incorrecta
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {i < selectedAttempt.questions.length - 1 && <hr className="border-slate-50" />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-[32px]">
                            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
                                <ChevronRight size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Selecciona un intento para revisar</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
