"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    Trophy,
    Users,
    BarChart3,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    TrendingDown,
    TrendingUp,
    Target,
    Layers,
    ChevronRight,
    Search,
    Filter,
} from "lucide-react"
import { getQuizById } from "@/actions/quizzes"
import { getQuizAnalytics } from "@/actions/quiz-stats"

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
                    <a
                        href="/admin/quizzes"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Volver a Cuestionarios
                    </a>
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
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-10"
                    >
                        {/* Featured Analysis Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <Target className="text-blue-500" /> Rendimiento por Campo
                                </h2>
                                <div className="space-y-6">
                                    {stats.topicStats.map((ts: any) => (
                                        <div key={ts.topic} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-slate-700">{ts.topic}</span>
                                                <span className={`text-sm font-black ${ts.avgSuccessRate >= 80 ? 'text-emerald-500' : ts.avgSuccessRate >= 50 ? 'text-blue-500' : 'text-red-500'}`}>
                                                    {ts.avgSuccessRate}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ts.avgSuccessRate}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${ts.avgSuccessRate >= 80 ? 'bg-emerald-500' : ts.avgSuccessRate >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[40px] p-10 space-y-8 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-175 transition-transform duration-1000">
                                    <Trophy size={160} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 relative z-10">
                                    <TrendingUp className="text-blue-400" /> Los más destacados
                                </h2>
                                <div className="space-y-4 relative z-10">
                                    {stats.userRanking.slice(0, 3).map((user: any, index: number) => (
                                        <div key={user.id} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between border border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                                                    ${index === 0 ? 'bg-amber-400 text-slate-900' : 
                                                      index === 1 ? 'bg-slate-300 text-slate-900' : 
                                                      'bg-orange-400 text-slate-900'}`}
                                                >
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{user.name}</p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{user.percentage}% - Completado</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-white/20" />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setActiveTab("ranking")}
                                    className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Ver Clasificación Completa
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "ranking" && (
                    <motion.div
                        key="ranking"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clasificación de Usuarios</h2>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Mostrando el Top 10 según rendimiento
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left">
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Posición</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Precisión</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Puntos</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.userRanking.map((user: any) => (
                                        <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all group">
                                            <td className="px-10 py-6">
                                                <span className={`text-lg font-black ${user.rank <= 3 ? 'text-blue-600' : 'text-slate-300'}`}>
                                                    #{user.rank.toString().padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800">{user.name}</p>
                                                        <p className="text-xs text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    user.percentage >= 80 ? 'bg-emerald-50 text-emerald-600' : 
                                                    user.percentage >= 50 ? 'bg-blue-50 text-blue-600' : 
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                    {user.percentage}% éxito
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-center font-black text-slate-700">
                                                {user.score} / {user.maxScore}
                                            </td>
                                            <td className="px-10 py-6 text-right text-xs text-slate-400 font-bold">
                                                {new Date(user.date).toLocaleDateString('es-ES', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === "questions" && (
                    <motion.div
                        key="questions"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stats.questionStats.map((qs: any, index: number) => (
                                <div key={qs.id} className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col h-full">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center text-xs font-black">
                                            Q{index + 1}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                            qs.successRate >= 70 ? 'bg-emerald-100 text-emerald-700' :
                                            qs.successRate >= 40 ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {qs.successRate}% Acierto
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 leading-relaxed flex-1">
                                        {qs.text}
                                    </p>
                                    <div className="pt-6 border-t border-slate-50 space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Correctas: {qs.correctCount}</span>
                                            <span>Errores: {qs.wrongCount}</span>
                                        </div>
                                        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${qs.successRate}%` }} />
                                            <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${100 - qs.successRate}%` }} />
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-2 mt-2">
                                        <Layers size={12} className="text-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{qs.topic}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "topics" && (
                    <motion.div
                        key="topics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {stats.topicStats.map((ts: any) => (
                            <div key={ts.topic} className="bg-white rounded-[40px] border border-slate-100 p-10 flex flex-col gap-8 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{ts.topic}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{ts.questionCount} preguntas en este tema</p>
                                    </div>
                                    <div className={`w-20 h-20 rounded-full border-8 flex items-center justify-center
                                        ${ts.avgSuccessRate >= 80 ? 'border-emerald-50 text-emerald-600' : 
                                          ts.avgSuccessRate >= 50 ? 'border-blue-50 text-blue-600' : 
                                          'border-red-50 text-red-600'}`}
                                    >
                                        <span className="text-xl font-black">{ts.avgSuccessRate}%</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de asimilación</h4>
                                    <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                                        {ts.avgSuccessRate >= 80 ? (
                                            <>
                                                <TrendingUp className="text-emerald-500" size={32} />
                                                <p className="text-sm font-medium text-slate-600">Este tema ha sido asimilado correctamente por la mayoría. No requiere intervención inmediata.</p>
                                            </>
                                        ) : ts.avgSuccessRate >= 50 ? (
                                            <>
                                                <AlertCircle className="text-blue-500" size={32} />
                                                <p className="text-sm font-medium text-slate-600">Rendimiento aceptable, pero hay lagunas detectadas. Se recomienda refuerzo ligero.</p>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="text-red-500" size={32} />
                                                <p className="text-sm font-medium text-slate-600">Rendimiento crítico. El contenido o la explicación de este tema no está siendo comprendido.</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color, description, danger = false }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        emerald: "bg-emerald-100 text-emerald-600",
        red: "bg-red-100 text-red-600",
        amber: "bg-amber-100 text-amber-600"
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-white rounded-[32px] border p-8 space-y-6 shadow-sm transition-all ${danger ? 'border-red-200 bg-red-50/10' : 'border-slate-100 hover:shadow-xl hover:shadow-slate-100'}`}
        >
            <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                    <Icon size={28} />
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">
                {description}
            </p>
        </motion.div>
    )
}

function AlertCircle({ size, className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}
