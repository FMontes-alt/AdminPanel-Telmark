"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    Trophy,
    BarChart3,
    Target,
    Layers,
    UserSearch,
} from "lucide-react"
import { getQuizWithDetailsBySlug } from "@/actions/quizzes"
import { getQuizAnalytics } from "@/actions/quiz-stats"
import { AdminPageHeader } from "@/components/ui/admin-page-header"

// Modular Components
import OverviewTab from "./components/OverviewTab"
import RankingTab from "./components/RankingTab"
import TopicsTab from "./components/TopicsTab"
import QuestionsTab from "./components/QuestionsTab"
import IndividualAnalysisTab from "./components/IndividualAnalysisTab"

export default function QuizResultsPage() {
    const { quizSlug } = useParams()
    const [activeTab, setActiveTab] = useState("overview")
    const [stats, setStats] = useState<any>(null)
    const [quiz, setQuiz] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const quizData = await getQuizWithDetailsBySlug(quizSlug as string)
        if (!quizData) {
            setLoading(false)
            return
        }
        const analyticsData = await getQuizAnalytics(quizData.id)
        setQuiz(quizData)
        setStats(analyticsData)
        setLoading(false)
    }, [quizSlug])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="p-8 lg:p-12 space-y-8 max-w-[1200px] mx-auto animate-pulse">
                <div className="h-8 bg-slate-200 rounded-2xl w-48" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[28px]" />)}
                </div>
                <div className="h-96 bg-slate-100 rounded-[40px]" />
            </div>
        )
    }

    if (!quiz || !stats) {
        return <div className="p-12 text-center text-slate-400 font-bold">Sin datos suficientes para este cuestionario</div>
    }

    const TABS = [
        { id: "overview", label: "Resumen", icon: BarChart3 },
        { id: "ranking", label: "Clasificación", icon: Trophy },
        { id: "topics", label: "Temas", icon: Layers },
        { id: "questions", label: "Mapa de Preguntas", icon: Target },
        { id: "individual", label: "Análisis Individual", icon: UserSearch },
    ]

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-[1400px] mx-auto min-h-screen">
            <button
                onClick={() => window.location.href = "/admin/monitoring"}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver al Monitoreo
            </button>

            <AdminPageHeader
                category="Estadísticas"
                title={<>Resultados de <span className="text-blue-600">{quiz.title}</span></>}
                description="Análisis profundo de asimilación de conceptos"
            />

            <div className="flex flex-wrap bg-slate-100/50 p-1.5 rounded-[24px] gap-1 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                            activeTab === tab.id
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <OverviewTab stats={stats} onSeeAllRanking={() => setActiveTab("ranking")} />
                )}

                {activeTab === "ranking" && (
                    <RankingTab stats={stats} />
                )}

                {activeTab === "questions" && (
                    <QuestionsTab stats={stats} />
                )}

                {activeTab === "topics" && (
                    <TopicsTab stats={stats} />
                )}

                {activeTab === "individual" && (
                    <IndividualAnalysisTab quizId={quiz.id} users={stats.userRanking || []} />
                )}
            </AnimatePresence>
        </div>
    )
}
