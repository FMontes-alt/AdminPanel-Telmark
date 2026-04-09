"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    Trophy,
    Users,
    BarChart3,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Target,
    Layers,
} from "lucide-react"
import { getQuizById } from "@/actions/quizzes"
import { getQuizAnalytics } from "@/actions/quiz-stats"

// Modular Components
import StatCard from "./components/StatCard"
import OverviewTab from "./components/OverviewTab"
import RankingTab from "./components/RankingTab"
import TopicsTab from "./components/TopicsTab"
import QuestionsTab from "./components/QuestionsTab"

export default function QuizResultsPage() {
    const { quizId } = useParams()
    const [activeTab, setActiveTab] = useState("overview")
    const [stats, setStats] = useState<any>(null)
    const [quiz, setQuiz] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const [quizData, analyticsData] = await Promise.all([
            getQuizById(quizId as string),
            getQuizAnalytics(quizId as string),
        ])
        setQuiz(quizData)
        setStats(analyticsData)
        setLoading(false)
    }, [quizId])

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
    ]

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-[1400px] mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => window.location.href = "/admin/quizzes"}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Volver a Cuestionarios
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">{quiz.title}</h1>
                        <p className="text-sm text-slate-400 font-medium mt-1">Análisis profundo de asimilación de conceptos</p>
                    </div>
                </div>

                <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
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
            </div>

            {/* Global Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Puntuación Media" 
                    value={`${stats.overallSuccessRate}%`} 
                    icon={TrendingUp} 
                    color="blue"
                    description="Rendimiento global de todos los usuarios"
                />
                <StatCard 
                    label="Participación" 
                    value={stats.attemptsCount} 
                    icon={Users} 
                    color="purple"
                    description="Usuarios únicos que han completado el quiz"
                />
                <StatCard 
                    label="Tema más fuerte" 
                    value={stats.topicStats[stats.topicStats.length - 1]?.topic || "N/A"} 
                    icon={CheckCircle2} 
                    color="emerald"
                    description={stats.topicStats[stats.topicStats.length - 1]?.avgSuccessRate + "% de éxito medio"}
                />
                <StatCard 
                    label="Punto Crítico" 
                    value={stats.topicStats[0]?.topic || "N/A"} 
                    icon={XCircle} 
                    color="red"
                    description="Requiere refuerzo inmediato"
                    danger={stats.topicStats[0]?.avgSuccessRate < 50}
                />
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
            </AnimatePresence>
        </div>
    )
}
