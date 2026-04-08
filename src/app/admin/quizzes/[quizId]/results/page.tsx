"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    Trophy,
    Users,
    BarChart3,
    Clock,
    CheckCircle2,
    XCircle,
    User,
} from "lucide-react"
import { getQuizById } from "@/actions/quizzes"
import { getQuizAttempts } from "@/actions/quiz-attempts"

export default function QuizResultsPage() {
    const { quizId } = useParams()
    const router = useRouter()
    const [quiz, setQuiz] = useState<any>(null)
    const [attempts, setAttempts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const [quizData, attemptsData] = await Promise.all([
            getQuizById(quizId as string),
            getQuizAttempts(quizId as string),
        ])
        setQuiz(quizData)
        setAttempts(attemptsData || [])
        setLoading(false)
    }, [quizId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const completedAttempts = attempts.filter(a => a.completedAt)
    const avgScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum, a) => sum + ((a.score || 0) / (a.maxScore || 1)) * 100, 0) / completedAttempts.length)
        : 0

    if (loading) {
        return (
            <div className="p-8 lg:p-12 space-y-8 max-w-[1200px] mx-auto animate-pulse">
                <div className="h-8 bg-slate-200 rounded-2xl w-48" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[24px]" />)}
                </div>
                <div className="h-64 bg-slate-100 rounded-[32px]" />
            </div>
        )
    }

    if (!quiz) return <div className="p-12 text-center text-slate-400 font-bold">Quiz no encontrado</div>

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-[1200px] mx-auto min-h-screen">
            <button
                onClick={() => router.push(`/admin/quizzes/${quizId}`)}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver al Editor
            </button>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{quiz.title}</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Resultados y estadísticas</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Users size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{attempts.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intentos Totales</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{completedAttempts.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completados</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                            <Trophy size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{avgScore}%</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puntuación Media</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Attempts Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Detalle de Intentos</h2>
                </div>

                {attempts.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                        <BarChart3 size={32} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-sm font-bold text-slate-400">Ningún usuario ha respondido este cuestionario todavía.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="text-left px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuario</th>
                                    <th className="text-left px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                    <th className="text-center px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puntuación</th>
                                    <th className="text-center px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="text-right px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt: any, i: number) => {
                                    const percentage = attempt.maxScore
                                        ? Math.round((attempt.score / attempt.maxScore) * 100)
                                        : 0

                                    return (
                                        <motion.tr
                                            key={attempt.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User size={14} className="text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-800">
                                                        {attempt.firstName} {attempt.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-500">{attempt.email}</td>
                                            <td className="px-4 py-4 text-center">
                                                {attempt.completedAt ? (
                                                    <span className={`text-sm font-black ${percentage >= 70 ? 'text-emerald-600' : percentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {attempt.score}/{attempt.maxScore}
                                                        <span className="text-[9px] font-bold text-slate-400 ml-1">({percentage}%)</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {attempt.completedAt ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                                                        <CheckCircle2 size={10} /> Completado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase">
                                                        <Clock size={10} /> En Progreso
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4 text-right text-xs text-slate-400">
                                                {new Date(attempt.startedAt).toLocaleDateString('es-ES', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
