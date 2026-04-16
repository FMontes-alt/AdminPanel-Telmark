"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    ChevronRight,
    Trophy,
    Shuffle,
    Play,
} from "lucide-react"
import { getSectionBySlug } from "@/actions/sections"
import { getPublishedQuizzes, getQuizQuestionCount } from "@/actions/quizzes"
import { getUserAttempts } from "@/actions/quiz-attempts"
import { createClient } from "@/lib/supabase/client"

export default function UserQuizzesPage() {
    const { sectionSlug } = useParams()
    const [section, setSection] = useState<any>(null)
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            const sec = await getSectionBySlug(sectionSlug as string)
            if (sec) {
                setSection(sec)
                const published = await getPublishedQuizzes(sec.id)

                // Enrich with question count and user attempts
                const enriched = await Promise.all(
                    (published || []).map(async (quiz: any) => {
                        const questionCount = await getQuizQuestionCount(quiz.id)
                        const attempts = user ? await getUserAttempts(quiz.id, user.id) : []
                        const bestAttempt = attempts
                            .filter((a: any) => a.completedAt)
                            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))[0]
                        return { ...quiz, questionCount, attemptCount: attempts.length, bestAttempt }
                    })
                )
                setQuizzes(enriched)
            }
            setLoading(false)
        }
        init()
    }, [sectionSlug])

    if (loading) {
        return (
            <div className="p-8 lg:p-12 space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 rounded-2xl w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-44 bg-slate-100 rounded-[28px]" />)}
                </div>
            </div>
        )
    }

    if (quizzes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="w-20 h-20 bg-slate-100 rounded-[28px] flex items-center justify-center">
                    <ClipboardList size={36} className="text-slate-300" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        Sin Cuestionarios
                    </h3>
                    <p className="text-sm text-slate-400 max-w-sm">
                        No hay cuestionarios disponibles en esta sección.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-5xl">
            <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Cuestionarios
                </h2>
                <p className="text-sm text-slate-400 font-medium mt-1">
                    {section?.name} · {quizzes.length} cuestionario{quizzes.length !== 1 ? "s" : ""} disponible{quizzes.length !== 1 ? "s" : ""}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map((quiz: any, i: number) => (
                    <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link
                            href={`/dashboard/${sectionSlug}/quizzes/${quiz.id}`}
                            className="group block bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden"
                        >
                            <div className="p-7 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <ClipboardList size={22} className="text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors mt-2" />
                                </div>

                                <div>
                                    <h3 className="text-base font-black text-slate-900 leading-tight tracking-tight">
                                        {quiz.title}
                                    </h3>
                                    {quiz.description && (
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <ClipboardList size={10} />
                                        {quiz.questionCount} pregunta{quiz.questionCount !== 1 ? "s" : ""}
                                    </span>
                                    {quiz.timeLimitMinutes && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {quiz.timeLimitMinutes} min
                                        </span>
                                    )}
                                    {quiz.randomizeQuestions && (
                                        <span className="flex items-center gap-1">
                                            <Shuffle size={10} />
                                            Aleatorio
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Footer status */}
                            <div className="px-7 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                {quiz.bestAttempt ? (
                                    <div className="flex items-center gap-2">
                                        <Trophy size={12} className="text-amber-500" />
                                        <span className="text-[10px] font-black text-emerald-600">
                                            Mejor: {quiz.bestAttempt.score}/{quiz.bestAttempt.maxScore}
                                            <span className="text-slate-400 ml-1">
                                                ({Math.round((quiz.bestAttempt.score / quiz.bestAttempt.maxScore) * 100)}%)
                                            </span>
                                        </span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                                        <Play size={10} /> Sin intentar
                                    </span>
                                )}
                                {quiz.attemptCount > 0 && (
                                    <span className="text-[9px] font-bold text-slate-400">
                                        {quiz.attemptCount} intento{quiz.attemptCount !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
