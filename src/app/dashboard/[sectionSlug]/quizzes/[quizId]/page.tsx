"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { getQuizById } from "@/actions/quizzes"
import { startAttempt, submitAnswer, completeAttempt, getAttemptResults } from "@/actions/quiz-attempts"
import { createClient } from "@/lib/supabase/client"

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
    const { sectionSlug, quizId } = useParams()
    const router = useRouter()

    const [phase, setPhase] = useState<Phase>("intro")
    const [quiz, setQuiz] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, { selectedOptions: string[]; textAnswer: string }>>({})

    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

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
            if (quiz.timeLimitMinutes) setTimeLeft(quiz.timeLimitMinutes * 60)
        }
    }

    const currentQuestion = questions[currentIndex]

    const handleSelectOption = (optionId: string) => {
        if (!currentQuestion) return
        const existing = answers[currentQuestion.id] || { selectedOptions: [], textAnswer: "" }
        if (currentQuestion.type === "single_choice" || currentQuestion.type === "true_false") {
            setAnswers({ ...answers, [currentQuestion.id]: { ...existing, selectedOptions: [optionId] } })
        } else if (currentQuestion.type === "multiple_choice") {
            const selected = existing.selectedOptions || []
            if (selected.includes(optionId)) {
                setAnswers({ ...answers, [currentQuestion.id]: { ...existing, selectedOptions: selected.filter(id => id !== optionId) } })
            } else {
                const maxSel = currentQuestion.maxSelections || 999
                if (selected.length < maxSel) {
                    setAnswers({ ...answers, [currentQuestion.id]: { ...existing, selectedOptions: [...selected, optionId] } })
                }
            }
        }
    }

    const handleTextAnswer = (text: string) => {
        if (!currentQuestion) return
        const existing = answers[currentQuestion.id] || { selectedOptions: [], textAnswer: "" }
        setAnswers({ ...answers, [currentQuestion.id]: { ...existing, textAnswer: text } })
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
                    selectedOptions: answer.selectedOptions, textAnswer: answer.textAnswer || undefined,
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
                    selectedOptions: answer.selectedOptions, textAnswer: answer.textAnswer || undefined,
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
    if (!quiz) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-400 font-bold">Cuestionario no encontrado</p></div>

    if (phase === "intro") {
        return (
            <IntroPhase 
                quiz={quiz} 
                questionsCount={questions.length} 
                onStart={handleStart} 
                onBack={() => router.push(`/dashboard/${sectionSlug}/quizzes`)}
            />
        )
    }

    if (phase === "results" && results) {
        return (
            <PersonalResults 
                results={results}
                onRepeat={() => {
                    setPhase("intro"); setCurrentIndex(0); setAnswers({}); setResults(null); setAttemptId(null); setTimeLeft(null);
                }}
                onBackToQuizzes={() => router.push(`/dashboard/${sectionSlug}/quizzes`)}
            />
        )
    }

    return (
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
            onTextAnswer={handleTextAnswer}
            isOptionDisabled={isOptionDisabled}
            selectedOptions={answers[currentQuestion?.id]?.selectedOptions || []}
            textAnswer={answers[currentQuestion?.id]?.textAnswer || ""}
            submitting={submitting}
            isLastQuestion={currentIndex === questions.length - 1}
        />
    )
}
