"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Clock,
    Trophy,
    Send,
    RotateCcw,
    ChevronLeft,
    Image as ImageIcon,
} from "lucide-react"
import { getQuizById } from "@/actions/quizzes"
import { startAttempt, submitAnswer, completeAttempt, getAttemptResults } from "@/actions/quiz-attempts"
import { createClient } from "@/lib/supabase/client"

type Phase = "intro" | "quiz" | "results"

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export default function QuizTakePage() {
    const { sectionSlug, quizId } = useParams()
    const router = useRouter()

    const [phase, setPhase] = useState<Phase>("intro")
    const [quiz, setQuiz] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    // Quiz state
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, { selectedOptions: string[]; textAnswer: string }>>({})

    // Timer
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Results
    const [results, setResults] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            const data = await getQuizById(quizId as string)
            if (data) {
                setQuiz(data)
                let qs = data.questions || []
                if (data.randomizeQuestions) {
                    qs = shuffleArray(qs).map((q: any) => ({
                        ...q,
                        options: q.type !== "short_answer" ? shuffleArray(q.options || []) : q.options,
                    }))
                }
                setQuestions(qs)
            }
            setLoading(false)
        }
        init()
    }, [quizId])

    // Timer effect
    useEffect(() => {
        if (phase !== "quiz" || timeLeft === null) return
        if (timeLeft <= 0) {
            handleFinish()
            return
        }
        timerRef.current = setTimeout(() => setTimeLeft(t => (t !== null ? t - 1 : null)), 1000)
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [phase, timeLeft])

    const handleStart = async () => {
        if (!userId) return
        const result = await startAttempt(quizId as string, userId)
        if (result?.success && result.data) {
            setAttemptId(result.data.id)
            setPhase("quiz")
            if (quiz.timeLimitMinutes) {
                setTimeLeft(quiz.timeLimitMinutes * 60)
            }
        }
    }

    const currentQuestion = questions[currentIndex]
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null

    const handleSelectOption = (optionId: string) => {
        if (!currentQuestion) return
        const existing = answers[currentQuestion.id] || { selectedOptions: [], textAnswer: "" }

        if (currentQuestion.type === "single_choice" || currentQuestion.type === "true_false") {
            setAnswers({
                ...answers,
                [currentQuestion.id]: { ...existing, selectedOptions: [optionId] },
            })
        } else if (currentQuestion.type === "multiple_choice") {
            const selected = existing.selectedOptions || []
            if (selected.includes(optionId)) {
                // Deselect
                setAnswers({
                    ...answers,
                    [currentQuestion.id]: { ...existing, selectedOptions: selected.filter(id => id !== optionId) },
                })
            } else {
                // Check max selections
                const maxSel = currentQuestion.maxSelections || 999
                if (selected.length < maxSel) {
                    setAnswers({
                        ...answers,
                        [currentQuestion.id]: { ...existing, selectedOptions: [...selected, optionId] },
                    })
                }
            }
        }
    }

    const handleTextAnswer = (text: string) => {
        if (!currentQuestion) return
        const existing = answers[currentQuestion.id] || { selectedOptions: [], textAnswer: "" }
        setAnswers({
            ...answers,
            [currentQuestion.id]: { ...existing, textAnswer: text },
        })
    }

    const isOptionDisabled = (optionId: string) => {
        if (!currentQuestion || currentQuestion.type !== "multiple_choice") return false
        const selected = answers[currentQuestion.id]?.selectedOptions || []
        const maxSel = currentQuestion.maxSelections || 999
        return selected.length >= maxSel && !selected.includes(optionId)
    }

    const handleNext = async () => {
        // Save current answer to server
        if (attemptId && currentQuestion) {
            const answer = answers[currentQuestion.id]
            if (answer) {
                await submitAnswer({
                    attemptId,
                    questionId: currentQuestion.id,
                    selectedOptions: answer.selectedOptions,
                    textAnswer: answer.textAnswer || undefined,
                })
            }
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
    }

    const handleFinish = async () => {
        if (!attemptId) return
        setSubmitting(true)

        // Submit last answer
        if (currentQuestion) {
            const answer = answers[currentQuestion.id]
            if (answer) {
                await submitAnswer({
                    attemptId,
                    questionId: currentQuestion.id,
                    selectedOptions: answer.selectedOptions,
                    textAnswer: answer.textAnswer || undefined,
                })
            }
        }

        // Complete attempt
        const completed = await completeAttempt(attemptId)

        // Get results
        const resultData = await getAttemptResults(attemptId)
        setResults({ attempt: completed?.data, details: resultData })
        setPhase("results")
        setSubmitting(false)

        if (timerRef.current) clearTimeout(timerRef.current)
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 font-bold">Cuestionario no encontrado</p>
            </div>
        )
    }

    // ─── PHASE: INTRO ─────────────────────────────────────────
    if (phase === "intro") {
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
                                <p className="text-2xl font-black text-slate-900">{questions.length}</p>
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
                            onClick={handleStart}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            Comenzar Cuestionario
                            <ArrowRight size={16} />
                        </button>

                        <button
                            onClick={() => router.back()}
                            className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={14} /> Volver
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // ─── PHASE: RESULTS ───────────────────────────────────────
    if (phase === "results" && results) {
        const attempt = results.attempt
        const percentage = attempt?.maxScore ? Math.round((attempt.score / attempt.maxScore) * 100) : 0
        const details = results.details?.questions || []

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 py-12">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[36px] shadow-xl border border-slate-100 overflow-hidden text-center"
                    >
                        <div className={`p-8 ${percentage >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : percentage >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
                            <Trophy size={40} className="mx-auto mb-3 opacity-80" />
                            <p className="text-5xl font-black">{percentage}%</p>
                            <p className="text-sm opacity-80 mt-1">
                                {attempt?.score} de {attempt?.maxScore} puntos
                            </p>
                        </div>
                        <div className="p-6">
                            <p className="text-lg font-black text-slate-900">
                                {percentage >= 70 ? "¡Excelente trabajo!" : percentage >= 40 ? "Buen intento" : "Sigue practicando"}
                            </p>
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
                                    {q.userAnswer?.isCorrect === null && <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Pendiente</span>}
                                </div>
                                {q.options && q.options.length > 0 && (
                                    <div className="ml-10 space-y-1.5">
                                        {q.options.map((opt: any) => {
                                            const userSelected = (q.userAnswer?.selectedOptions || []).includes(opt.id)
                                            return (
                                                <div
                                                    key={opt.id}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                                        opt.isCorrect
                                                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                                            : userSelected
                                                                ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                                                                : "bg-slate-50 text-slate-400"
                                                    }`}
                                                >
                                                    {opt.isCorrect && <CheckCircle2 size={12} className="text-emerald-500" />}
                                                    {!opt.isCorrect && userSelected && <XCircle size={12} className="text-red-500" />}
                                                    {opt.text}
                                                    {userSelected && !opt.isCorrect && (
                                                        <span className="ml-auto text-[9px] font-black uppercase">Tu respuesta</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                {q.type === "short_answer" && q.userAnswer?.textAnswer && (
                                    <div className="ml-10 mt-2 bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
                                        <span className="font-bold">Tu respuesta:</span> {q.userAnswer.textAnswer}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setPhase("intro")
                                setCurrentIndex(0)
                                setAnswers({})
                                setResults(null)
                                setAttemptId(null)
                                setTimeLeft(null)
                            }}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <RotateCcw size={16} /> Repetir
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/${sectionSlug}/quizzes`)}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={16} /> Volver
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ─── PHASE: QUIZ ──────────────────────────────────────────
    if (!currentQuestion) return null

    const selectedOptions = currentAnswer?.selectedOptions || []
    const isLastQuestion = currentIndex === questions.length - 1
    const hasAnswer = selectedOptions.length > 0 || (currentAnswer?.textAnswer && currentAnswer.textAnswer.trim().length > 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {currentIndex + 1} / {questions.length}
                    </span>
                    {/* Progress bar */}
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>
                {timeLeft !== null && (
                    <div className={`flex items-center gap-1.5 text-sm font-black ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                        <Clock size={14} />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Question Content */}
            <div className="flex-1 flex items-center justify-center p-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="max-w-2xl w-full space-y-8"
                    >
                        {/* Media */}
                        {currentQuestion.mediaUrl && currentQuestion.mediaType !== "none" && (
                            <div className="rounded-[24px] overflow-hidden border border-slate-200 shadow-sm bg-white">
                                {currentQuestion.mediaType === "image" ? (
                                    <img
                                        src={currentQuestion.mediaUrl}
                                        alt="Pregunta"
                                        className="w-full max-h-72 object-contain bg-slate-50"
                                    />
                                ) : (
                                    <video
                                        src={currentQuestion.mediaUrl}
                                        controls
                                        className="w-full max-h-72"
                                    />
                                )}
                            </div>
                        )}

                        {/* Question Text */}
                        <div className="text-center">
                            <p className="text-xl font-black text-slate-900 leading-relaxed">
                                {currentQuestion.text}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                {currentQuestion.points} punto{currentQuestion.points > 1 ? "s" : ""}
                                {currentQuestion.type === "multiple_choice" && currentQuestion.maxSelections && (
                                    <span className="ml-2">
                                        · Selecciona máximo {currentQuestion.maxSelections}
                                        <span className="ml-1 text-blue-500">
                                            ({selectedOptions.length}/{currentQuestion.maxSelections})
                                        </span>
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Answer Options */}
                        {(currentQuestion.type === "single_choice" || currentQuestion.type === "multiple_choice") && (
                            <div className="space-y-3">
                                {currentQuestion.options?.map((opt: any) => {
                                    const isSelected = selectedOptions.includes(opt.id)
                                    const disabled = isOptionDisabled(opt.id)

                                    return (
                                        <motion.button
                                            key={opt.id}
                                            whileTap={!disabled ? { scale: 0.98 } : {}}
                                            onClick={() => !disabled && handleSelectOption(opt.id)}
                                            disabled={disabled}
                                            className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all ${
                                                isSelected
                                                    ? "border-blue-600 bg-blue-50 text-blue-800 shadow-lg shadow-blue-500/10"
                                                    : disabled
                                                        ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50"
                                                        : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 text-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                    isSelected
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-slate-200"
                                                }`}>
                                                    {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-bold">{opt.text}</span>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        )}

                        {/* True/False */}
                        {currentQuestion.type === "true_false" && (
                            <div className="grid grid-cols-2 gap-4">
                                {currentQuestion.options?.map((opt: any) => {
                                    const isSelected = selectedOptions.includes(opt.id)
                                    const isTrue = opt.text.toLowerCase() === "verdadero"
                                    return (
                                        <motion.button
                                            key={opt.id}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleSelectOption(opt.id)}
                                            className={`py-6 rounded-2xl font-black text-lg transition-all border-2 ${
                                                isSelected
                                                    ? isTrue
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/10"
                                                        : "border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-500/10"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                            }`}
                                        >
                                            {opt.text}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Short Answer */}
                        {currentQuestion.type === "short_answer" && (
                            <textarea
                                value={currentAnswer?.textAnswer || ""}
                                onChange={(e) => handleTextAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                rows={4}
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium text-slate-700 outline-none focus:border-blue-300 transition-all resize-none"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between sticky bottom-0">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ArrowLeft size={14} /> Anterior
                </button>

                {/* Question dots */}
                <div className="hidden md:flex items-center gap-1.5">
                    {questions.map((_: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                i === currentIndex
                                    ? "bg-blue-600 w-6"
                                    : answers[questions[i].id]
                                        ? "bg-emerald-400"
                                        : "bg-slate-200"
                            }`}
                        />
                    ))}
                </div>

                {isLastQuestion ? (
                    <button
                        onClick={handleFinish}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        <Send size={14} /> {submitting ? "Enviando..." : "Finalizar"}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                        Siguiente <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}
