"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    ClipboardList,
    Clock,
    ChevronRight,
    Trophy,
    Shuffle,
    Play,
    LayoutGrid,
    Lock
} from "lucide-react"
import { getSectionBySlug } from "@/actions/sections"
import { getPublishedQuizzes, getQuizQuestionCount } from "@/actions/quizzes"
import { getUserAttempts } from "@/actions/quiz-attempts"
import { checkUserSectionAccess, checkQuizUnlocked } from "@/actions/quiz-access"
import { getFilteredHierarchy } from "@/actions/hierarchy"
import { createClient } from "@/lib/supabase/client"

// Importar el nuevo Header
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"

export default function UserQuizzesPage() {
    const { sectionSlug } = useParams()
    const router = useRouter()
    const [section, setSection] = useState<any>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            const sec = await getSectionBySlug(sectionSlug as string)
            if (sec) {
                setSection(sec)
                
                if (user) {
                    const hasAccess = await checkUserSectionAccess(user.id, sec.id)
                    if (!hasAccess) {
                        setQuizzes([])
                        setLoading(false)
                        return
                    }
                    
                    const catsWithSubs = await getFilteredHierarchy(sec.id)
                    setCategories(catsWithSubs)

                    const published = await getPublishedQuizzes(sec.id)

                    // Enrich with question count, user attempts, and unlock status
                    const enriched = await Promise.all(
                        (published || []).map(async (quiz: any) => {
                            const questionCount = await getQuizQuestionCount(quiz.id)
                            const attempts = await getUserAttempts(quiz.id, user.id)
                            const bestAttempt = attempts
                                .filter((a: any) => a.completedAt)
                                .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))[0]
                                
                            const unlockStatus = await checkQuizUnlocked(user.id, quiz.id)
                            
                            return { 
                                ...quiz, 
                                questionCount, 
                                attemptCount: attempts.length, 
                                bestAttempt,
                                unlocked: unlockStatus.unlocked,
                                requiredQuizTitle: unlockStatus.requiredQuizTitle
                            }
                        })
                    )
                    setQuizzes(enriched)
                }
            }
            setLoading(false)
        }
        init()
    }, [sectionSlug])

    const filteredQuizzes = useMemo(() => {
        if (!searchTerm) return quizzes
        return quizzes.filter(quiz => 
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [quizzes, searchTerm])

    if (loading) {
        return (
            <div className="h-screen bg-[#fafafa] flex overflow-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600">
                <DashboardSidebar 
                    section={section || { name: "Cargando..." }}
                    categories={categories} 
                    selectedCategoryId={null}
                    onSelectCategory={() => router.push(`/dashboard/${sectionSlug}`)}
                    quizCount={0}
                    sectionSlug={sectionSlug as string}
                />
                <main className="flex-1 flex flex-col h-full bg-white relative">
                    <DashboardHeader 
                        sectionName={section?.name || "Cargando..."}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                    <div className="flex-1 flex items-center justify-center bg-[#fafafa]/50">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-lg" />
                            <div className="text-center space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Cargando</p>
                                <p className="text-sm font-bold text-slate-900 tracking-tight">Evaluación y Formación</p>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#fafafa] flex overflow-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600">
            {/* Sidebar Reutilizado con props correctas */}
            <DashboardSidebar 
                section={section || {}}
                categories={categories} 
                selectedCategoryId={null}
                onSelectCategory={() => router.push(`/dashboard/${sectionSlug}`)}
                quizCount={quizzes.length}
                sectionSlug={sectionSlug as string}
            />

            <main className="flex-1 flex flex-col h-full bg-white relative">
                {/* Header Integrado */}
                <DashboardHeader 
                    sectionName={section?.name || "Campañas"}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fafafa]/50 p-8 lg:p-12">
                    <div className="max-w-5xl mx-auto space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-12 bg-blue-600" />
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Evaluación y Formación</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                Cuestionarios
                            </h2>
                            <p className="text-slate-500 text-lg font-medium">
                                {section?.name} · {filteredQuizzes.length} disponible{filteredQuizzes.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {filteredQuizzes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                                <div className="w-20 h-20 bg-slate-100 rounded-[28px] flex items-center justify-center">
                                    <ClipboardList size={36} className="text-slate-300" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sin Resultados</h3>
                                    <p className="text-sm text-slate-400">No se han encontrado cuestionarios que coincidan con tu búsqueda.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                <AnimatePresence mode="popLayout">
                                    {filteredQuizzes.map((quiz, i) => (
                                        <motion.div
                                            key={quiz.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Link
                                                href={quiz.unlocked ? `/dashboard/${sectionSlug}/quizzes/${quiz.slug}` : "#"}
                                                onClick={(e) => {
                                                    if (!quiz.unlocked) {
                                                        e.preventDefault();
                                                        alert(`Este cuestionario está bloqueado. Primero debes aprobar "${quiz.requiredQuizTitle}"`);
                                                    }
                                                }}
                                                className={`group block bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all overflow-hidden ${!quiz.unlocked ? 'opacity-60 cursor-not-allowed shadow-none' : ''}`}
                                            >
                                                <div className="p-8 space-y-5">
                                                    <div className="flex items-start justify-between">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${!quiz.unlocked ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30'}`}>
                                                            {!quiz.unlocked ? <Lock size={24} /> : <ClipboardList size={24} />}
                                                        </div>
                                                        {quiz.unlocked && (
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                                                                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                                                            {quiz.title}
                                                        </h3>
                                                        {quiz.description && (
                                                            <p className="text-sm text-slate-500 line-clamp-2 font-medium">{quiz.description}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-t border-slate-50 pt-5">
                                                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                                                            <ClipboardList size={12} className="text-blue-600" />
                                                            {quiz.questionCount} preguntas
                                                        </span>
                                                        {quiz.timeLimitMinutes && (
                                                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                                                                <Clock size={12} className="text-orange-500" />
                                                                {quiz.timeLimitMinutes} min
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                                                            <Trophy size={12} className="text-amber-500" />
                                                            Mín. {quiz.passingScore}%
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                                                    {!quiz.unlocked ? (
                                                        <span className="flex items-center gap-2 text-[11px] font-black text-rose-500 uppercase tracking-tight">
                                                            <Lock size={12} /> Bloqueado - Prerrequisito: {quiz.requiredQuizTitle}
                                                        </span>
                                                    ) : quiz.bestAttempt ? (
                                                        <div className="flex items-center gap-2">
                                                            <Trophy size={14} className="text-amber-500" />
                                                            <span className={`text-[11px] font-black uppercase tracking-tight ${
                                                                (quiz.bestAttempt.score !== null && quiz.bestAttempt.maxScore !== null && quiz.bestAttempt.maxScore > 0 && (quiz.bestAttempt.score / quiz.bestAttempt.maxScore) * 100 >= quiz.passingScore)
                                                                    ? 'text-emerald-600'
                                                                    : 'text-rose-500'
                                                            }`}>
                                                                Récord: {quiz.bestAttempt.score}/{quiz.bestAttempt.maxScore} ({quiz.bestAttempt.maxScore > 0 ? Math.round((quiz.bestAttempt.score / quiz.bestAttempt.maxScore) * 100) : 0}%)
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-tight">
                                                            <Play size={12} fill="currentColor" /> Comenzar Ahora
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </main>


        </div>
    )
}
