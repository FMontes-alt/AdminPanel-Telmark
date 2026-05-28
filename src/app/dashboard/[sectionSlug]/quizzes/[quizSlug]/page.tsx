"use client"


import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { getPublishedQuizzes, getQuizWithDetailsBySlug } from "@/actions/quizzes"
import { startAttempt, submitAnswer, completeAttempt, getAttemptResults } from "@/actions/quiz-attempts"
import { createClient } from "@/lib/supabase/client"
import { getSectionBySlug } from "@/actions/sections"
import { getFilteredHierarchy } from "@/actions/hierarchy"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { AlertTriangle, X } from "lucide-react"

// Modular Components
import IntroPhase from "./components/IntroPhase"
import QuizPhase from "./components/QuizPhase"
import PersonalResults from "./components/PersonalResults"

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
    const { sectionSlug, quizSlug } = useParams()
    const router = useRouter()

    const [phase, setPhase] = useState<Phase>("intro")
    const [section, setSection] = useState<any>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [quizCount, setQuizCount] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [quiz, setQuiz] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, { selectedOptions: string[] }>>({})

    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const [results, setResults] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            const sec = await getSectionBySlug(sectionSlug as string)
            if (sec) {
                setSection(sec)
                const [catsWithSubs, published] = await Promise.all([
                    getFilteredHierarchy(sec.id),
                    getPublishedQuizzes(sec.id),
                ])
                setCategories(catsWithSubs)
                setQuizCount(published.length)
            }

            const data = await getQuizWithDetailsBySlug(decodeURIComponent(quizSlug as string))
            if (data) {
                setQuiz(data)
                let qs = data.questions || []
                if (data.randomizeQuestions) {
                    qs = shuffleArray(qs).map((q: any) => ({
                        ...q,
                        options: shuffleArray(q.options || []),
                    }))
                }
                setQuestions(qs)
            }
            setLoading(false)
        }
        init()
    }, [sectionSlug, quizSlug])

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
        if (!userId || !quiz) return
        const result = await startAttempt(quiz.id, userId)
        if (result?.success && result.data) {
            setAttemptId(result.data.id)
            setPhase("quiz")
            if (quiz.timeLimitMinutes) setTimeLeft(quiz.timeLimitMinutes * 60)
        } else if (result?.error) {
            alert(result.error)
        }
    }

    const currentQuestion = questions[currentIndex]

    const handleSelectOption = (optionId: string) => {
        if (!currentQuestion) return
        const existing = answers[currentQuestion.id] || { selectedOptions: [] }
        if (currentQuestion.type === "single_choice" || currentQuestion.type === "true_false") {
            setAnswers({ ...answers, [currentQuestion.id]: { selectedOptions: [optionId] } })
        } else if (currentQuestion.type === "multiple_choice") {
            const selected = existing.selectedOptions || []
            if (selected.includes(optionId)) {
                setAnswers({ ...answers, [currentQuestion.id]: { selectedOptions: selected.filter(id => id !== optionId) } })
            } else {
                const maxSel = currentQuestion.maxSelections || 999
                if (selected.length < maxSel) {
                    setAnswers({ ...answers, [currentQuestion.id]: { selectedOptions: [...selected, optionId] } })
                }
            }
        }
    }

    const isOptionDisabled = (optionId: string) => {
        if (!currentQuestion || currentQuestion.type !== "multiple_choice") return false
        const selected = answers[currentQuestion.id]?.selectedOptions || []
        const maxSel = currentQuestion.maxSelections || 999
        return selected.length >= maxSel && !selected.includes(optionId)
    }

    const handleNext = async () => {
        if (attemptId && currentQuestion) {
            const answer = answers[currentQuestion.id]
            if (answer) {
                await submitAnswer({
                    attemptId, questionId: currentQuestion.id,
                    selectedOptions: answer.selectedOptions,
                })
            }
        }
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
    }

    const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1) }

    const handleFinish = async () => {
        if (!attemptId) return
        setSubmitting(true)
        if (currentQuestion) {
            const answer = answers[currentQuestion.id]
            if (answer) {
                await submitAnswer({
                    attemptId, questionId: currentQuestion.id,
                    selectedOptions: answer.selectedOptions,
                })
            }
        }
        const completed = await completeAttempt(attemptId)
        const resultData = await getAttemptResults(attemptId)
        setResults({ attempt: completed?.data, details: resultData })
        setPhase("results")
        setSubmitting(false)
        if (timerRef.current) clearTimeout(timerRef.current)
    }

    const handleCancel = () => {
        setShowCancelModal(true)
    }

    const confirmCancel = () => {
        setShowCancelModal(false)
        router.push(`/dashboard/${sectionSlug}/quizzes`)
    }

    const renderShell = (content: any) => (
        <div className="h-screen bg-[#fafafa] flex overflow-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600">
            <DashboardSidebar
                section={section || { name: "Cargando..." }}
                categories={categories}
                selectedCategoryId={null}
                onSelectCategory={() => router.push(`/dashboard/${sectionSlug}`)}
                quizCount={quizCount || 1}
                sectionSlug={sectionSlug as string}
            />

            <main className="flex-1 flex flex-col h-full bg-white relative">
                <DashboardHeader
                    sectionName={section?.name || "Cargando..."}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fafafa]/50">
                    {content}
                </div>
            </main>

            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="p-6 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Cancelar intento</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1">
                                    Si sales ahora, el progreso de este cuestionario no se guardará.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                            >
                                Continuar
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                            >
                                Cancelar intento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    if (loading) {
        return renderShell(
            <div className="h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!quiz) {
        return renderShell(
            <div className="h-full flex items-center justify-center">
                <p className="text-slate-400 font-bold">Cuestionario no encontrado</p>
            </div>
        )
    }

    if (phase === "intro") {
        return renderShell(
            <IntroPhase 
                quiz={quiz} 
                questionsCount={questions.length} 
                onStart={handleStart} 
                onBack={() => router.push(`/dashboard/${sectionSlug}/quizzes`)}
                embedded
            />
        )
    }

    if (phase === "results" && results) {
        return renderShell(
            <PersonalResults 
                results={results}
                onRepeat={() => {
                    setPhase("intro"); setCurrentIndex(0); setAnswers({}); setResults(null); setAttemptId(null); setTimeLeft(null);
                }}
                onBackToQuizzes={() => router.push(`/dashboard/${sectionSlug}/quizzes`)}
                embedded
            />
        )
    }

    return renderShell(
        <QuizPhase 
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            timeLeft={timeLeft}
            formatTime={(s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`}
            onPrev={handlePrev}
            onNext={handleNext}
            onFinish={handleFinish}
            onSelectOption={handleSelectOption}
            isOptionDisabled={isOptionDisabled}
            selectedOptions={answers[currentQuestion?.id]?.selectedOptions || []}
            submitting={submitting}
            isLastQuestion={currentIndex === questions.length - 1}
            onCancel={handleCancel}
            embedded
        />
    )
}
