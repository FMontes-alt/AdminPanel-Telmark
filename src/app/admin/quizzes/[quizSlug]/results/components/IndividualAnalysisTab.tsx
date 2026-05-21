"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Users, 
    Trophy, 
    Calendar, 
    RotateCcw, 
    CheckCircle2, 
    XCircle, 
    Award,
    TrendingUp,
    Bookmark
} from "lucide-react"
import { getUserQuizAnalytics } from "@/actions/quiz-stats"

interface IndividualAnalysisTabProps {
    quizId: string
    users: any[] // stats.userRanking
}

export default function IndividualAnalysisTab({ quizId, users = [] }: IndividualAnalysisTabProps) {
    const [selectedUserId, setSelectedUserId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [analytics, setAnalytics] = useState<any>(null)

    useEffect(() => {
        if (users.length > 0 && !selectedUserId) {
            setSelectedUserId(users[0].userId)
        }
    }, [users, selectedUserId])

    useEffect(() => {
        const fetchUserData = async () => {
            if (!selectedUserId) {
                setAnalytics(null)
                return
            }
            setLoading(true)
            try {
                const data = await getUserQuizAnalytics(quizId, selectedUserId)
                setAnalytics(data)
            } catch (error) {
                console.error("Error loading user analytics:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUserData()
    }, [quizId, selectedUserId])

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-100 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <Users size={28} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Sin Intentos Registrados</h4>
                    <p className="text-xs text-slate-400 max-w-xs">Ningún usuario ha completado un intento en este cuestionario todavía.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* User Selector Dropdown */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Análisis por Usuario</h3>
                    <p className="text-xs text-slate-400">Selecciona un usuario para analizar su rendimiento detallado.</p>
                </div>
                <div className="w-full md:w-80">
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-200 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none transition-all shadow-sm"
                    >
                        {users.map((u) => (
                            <option key={u.userId} value={u.userId}>
                                {u.name} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Analytics Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 space-y-4"
                    >
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Obteniendo análisis de usuario...</p>
                    </motion.div>
                ) : analytics ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-8 animate-fadeIn"
                    >
                        {/* Upper Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Trophy size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-2xl font-black text-slate-900">
                                        {analytics.bestAttempt.maxScore ? Math.round((analytics.bestAttempt.score / analytics.bestAttempt.maxScore) * 100) : 0}%
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mejor Nota</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Award size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-2xl font-black text-slate-900">
                                        {analytics.bestAttempt.score} / {analytics.bestAttempt.maxScore}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Puntos Máximos</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <RotateCcw size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-2xl font-black text-slate-900">{analytics.attemptsCount}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intentos Totales</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Calendar size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black text-slate-800 line-clamp-1">
                                        {analytics.bestAttempt.completedAt ? new Date(analytics.bestAttempt.completedAt).toLocaleDateString("es-ES") : "Sin fecha"}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha del Examen</p>
                                </div>
                            </div>
                        </div>

                        {/* Mid Row: Topics & Attempt History */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Topic Analysis */}
                            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-6">
                                <div className="flex items-center gap-2">
                                    <Bookmark size={18} className="text-blue-600" />
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Rendimiento por Tema</h4>
                                </div>
                                <div className="space-y-5">
                                    {analytics.topicAnalysis.map((topicStat: any) => (
                                        <div key={topicStat.topic} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-slate-600 font-black">{topicStat.topic}</span>
                                                <span className="text-slate-400">{topicStat.correct} de {topicStat.total} correctas ({topicStat.percentage}%)</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        topicStat.percentage >= 70 ? 'bg-emerald-500' :
                                                        topicStat.percentage >= 40 ? 'bg-amber-500' :
                                                        'bg-red-500'
                                                    }`}
                                                    style={{ width: `${topicStat.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attempt History */}
                            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={18} className="text-blue-600" />
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Historial de Intentos</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                                <th className="pb-3 pl-2">Intento</th>
                                                <th className="pb-3 text-center">Puntaje</th>
                                                <th className="pb-3 text-center">Porcentaje</th>
                                                <th className="pb-3 pr-2 text-right">Fecha / Hora</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.attempts.map((att: any, idx: number) => {
                                                const attPercentage = att.maxScore ? Math.round((att.score / att.maxScore) * 100) : 0
                                                return (
                                                    <tr key={att.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                                        <td className="py-3.5 pl-2 font-black text-slate-700">Intento #{analytics.attempts.length - idx}</td>
                                                        <td className="py-3.5 text-center font-bold text-slate-600">{att.score} / {att.maxScore}</td>
                                                        <td className="py-3.5 text-center">
                                                            <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${
                                                                attPercentage >= 70 ? 'bg-emerald-50 text-emerald-700' :
                                                                attPercentage >= 40 ? 'bg-amber-50 text-amber-700' :
                                                                'bg-red-50 text-red-700'
                                                            }`}>
                                                                {attPercentage}%
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 pr-2 text-right text-slate-400 font-medium">
                                                            {att.completedAt ? new Date(att.completedAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) : "Sin fecha"}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Question Review */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Revisión Detallada de Preguntas</h4>
                            <div className="space-y-4">
                                {analytics.questions.map((q: any, i: number) => (
                                    <div
                                        key={q.id}
                                        className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-blue-100 transition-all duration-300"
                                    >
                                        <div className="flex-1 space-y-4">
                                            {/* Question Text */}
                                            <div className="flex items-start gap-3">
                                                <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-black text-slate-500 flex-shrink-0">
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 leading-snug">{q.text}</p>
                                                    <span className="inline-block mt-1 text-[9px] bg-slate-50 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wider">
                                                        {q.topic || "General"} · {q.points} punto{q.points > 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Options list */}
                                            {q.options && q.options.length > 0 && (
                                                <div className="ml-10 space-y-2">
                                                    {q.options.map((opt: any) => {
                                                        const isSelected = (q.userAnswer?.selectedOptions || []).includes(opt.id)
                                                        return (
                                                            <div
                                                                key={opt.id}
                                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                                    opt.isCorrect
                                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                                                                        : isSelected
                                                                            ? "bg-red-50 text-red-800 border border-red-100"
                                                                            : "bg-slate-50 text-slate-500 border border-transparent"
                                                                }`}
                                                            >
                                                                {opt.isCorrect && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                                                                {!opt.isCorrect && isSelected && <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                                                                <span className="flex-1">{opt.text}</span>
                                                                {isSelected && (
                                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                                        opt.isCorrect ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"
                                                                    }`}>
                                                                        Seleccionada
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex-shrink-0 md:pt-1">
                                            {q.userAnswer?.isCorrect === true ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 size={12} />
                                                    Correcta
                                                </div>
                                            ) : q.userAnswer?.isCorrect === false ? (
                                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    <XCircle size={12} />
                                                    Incorrecta
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    Sin responder
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="p-12 text-center text-slate-400 font-bold bg-white border border-slate-100 rounded-[32px]">No se encontraron intentos para este usuario</div>
                )}
            </AnimatePresence>
        </div>
    )
}
