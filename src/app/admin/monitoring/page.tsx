"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    Activity,
    BarChart3,
    Clock,
    FileText,
    CheckCircle2
} from "lucide-react"
import { getQuizzes } from "@/actions/quizzes"
import { AdminPageHeader } from "@/components/ui/admin-page-header"

export default function MonitoringPage() {
    const router = useRouter()
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const q = await getQuizzes()
            setQuizzes(q || [])
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 lg:p-12 space-y-8 max-w-[1400px] mx-auto animate-pulse">
                <div className="h-10 bg-slate-200 rounded-2xl w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-[32px]" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            <AdminPageHeader
                category="Operativa"
                title={<>Centro de <span className="text-blue-600">Monitoreo</span></>}
                description="Analiza los resultados de evaluación y lleva el seguimiento del rendimiento de tu equipo."
            />

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="text-blue-600" size={20} />
                        Monitoreo de Cuestionarios
                    </h3>
                    <p className="text-sm text-slate-400">Selecciona un cuestionario para ver sus métricas detalladas.</p>
                </div>

                {quizzes.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm border-dashed">
                        <div className="max-w-sm mx-auto space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                <BarChart3 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Sin datos analíticos</h3>
                            <p className="text-sm text-slate-500">Aún no hay cuestionarios creados en la plataforma para monitorizar.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz: any) => {
                            return (
                                <motion.div
                                    key={quiz.id}
                                    whileHover={{ y: -4 }}
                                    className="group bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden flex flex-col"
                                >
                                    {/* Card Header */}
                                    <div className="px-8 py-6 border-b border-slate-50 bg-blue-50/30">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                                                quiz.isPublished
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {quiz.isPublished ? "Activo" : "Borrador"}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight">
                                            {quiz.title}
                                        </h3>
                                    </div>

                                    {/* Card Body */}
                                    <div className="px-8 py-5 space-y-4 flex-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <FileText size={14} />
                                            <span>{quiz.sectionName || "Sin sección asignada"}</span>
                                        </div>

                                        {quiz.timeLimitMinutes && (
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                <div className="p-1 bg-slate-100 rounded-md">
                                                    <Clock size={12} />
                                                </div>
                                                {quiz.timeLimitMinutes} mins límite
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer / Action */}
                                    <div className="px-4 py-4 border-t border-slate-50 bg-slate-50/50">
                                        <button
                                            onClick={() => router.push(`/admin/quizzes/${quiz.slug}/results`)}
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            <BarChart3 size={14} />
                                            Ver Resultados
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
