"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ClipboardList,
    Plus,
    Search,
    Eye,
    EyeOff,
    Trash2,
    ChevronRight,
    BarChart3,
    Clock,
    Shuffle,
    FileText,
    Play,
} from "lucide-react"
import { getQuizzes, createQuiz, deleteQuiz, publishQuiz } from "@/actions/quizzes"
import { getSections } from "@/actions/sections"

export default function AdminQuizzesPage() {
    const router = useRouter()
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [sections, setSections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form
    const [newTitle, setNewTitle] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [newSectionId, setNewSectionId] = useState("")
    const [newTimeLimit, setNewTimeLimit] = useState<string>("")
    const [newRandomize, setNewRandomize] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [q, s] = await Promise.all([getQuizzes(), getSections()])
            setQuizzes(q || [])
            setSections(s || [])
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSectionId || !newTitle) return
        try {
            const result = await createQuiz({
                sectionId: newSectionId,
                title: newTitle,
                description: newDescription || undefined,
                timeLimitMinutes: newTimeLimit ? parseInt(newTimeLimit) : null,
                randomizeQuestions: newRandomize,
            })
            if (result?.success && result.data) {
                router.push(`/admin/quizzes/${result.data.id}`)
            }
        } catch (error) {
            console.error("Error creating quiz:", error)
        }
    }

    const handleTogglePublish = async (quizId: string, currentState: boolean) => {
        await publishQuiz(quizId, !currentState)
        fetchData()
    }

    const handleDelete = async (quizId: string) => {
        setDeletingId(quizId)
        await deleteQuiz(quizId)
        setDeletingId(null)
        fetchData()
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
        <div className="p-8 lg:p-12 space-y-10 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                        Cuestionarios
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        {quizzes.length} cuestionario{quizzes.length !== 1 ? "s" : ""} creado{quizzes.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={16} />
                    Nuevo
                </button>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form
                            onSubmit={handleCreate}
                            className="bg-white/70 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-sm space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        Título del Cuestionario
                                    </label>
                                    <input
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Ej: Examen de Producto ADESLAS"
                                        className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm transition-all border outline-none font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        Sección
                                    </label>
                                    <select
                                        value={newSectionId}
                                        onChange={(e) => setNewSectionId(e.target.value)}
                                        className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm transition-all border outline-none font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5"
                                        required
                                    >
                                        <option value="">Selecciona una sección...</option>
                                        {sections.map((s: any) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Breve descripción del cuestionario..."
                                    rows={2}
                                    className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm transition-all border outline-none font-medium text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        Tiempo Límite (minutos)
                                    </label>
                                    <input
                                        value={newTimeLimit}
                                        onChange={(e) => setNewTimeLimit(e.target.value)}
                                        type="number"
                                        min="1"
                                        placeholder="Sin límite"
                                        className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 px-6 text-sm transition-all border outline-none font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/5"
                                    />
                                </div>
                                <div className="space-y-2 flex items-end">
                                    <label
                                        className="flex items-center gap-3 cursor-pointer bg-slate-100/50 rounded-2xl py-4 px-6 w-full hover:bg-slate-100 transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={newRandomize}
                                            onChange={(e) => setNewRandomize(e.target.checked)}
                                            className="w-5 h-5 rounded-lg accent-blue-600"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">Orden Aleatorio</p>
                                            <p className="text-[10px] text-slate-400">Las preguntas se muestran en orden diferente para cada usuario</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-blue-600 text-white rounded-[20px] text-xs font-bold uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
                                >
                                    Crear y Añadir Preguntas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-8 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quiz Grid */}
            {quizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-[28px] flex items-center justify-center">
                        <ClipboardList size={36} className="text-slate-300" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                            Sin Cuestionarios
                        </h3>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Crea tu primer cuestionario para empezar a evaluar a los usuarios de tus secciones.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={16} />
                        Crear Primer Cuestionario
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz: any) => (
                        <motion.div
                            key={quiz.id}
                            whileHover={{ y: -4 }}
                            className="group bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className={`px-8 py-6 border-b border-slate-50 ${quiz.isPublished ? 'bg-emerald-50/50' : 'bg-amber-50/50'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                                        quiz.isPublished
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {quiz.isPublished ? "Publicado" : "Borrador"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {quiz.timeLimitMinutes && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                                <Clock size={10} />
                                                {quiz.timeLimitMinutes}min
                                            </span>
                                        )}
                                        {quiz.randomizeQuestions && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 ml-2">
                                                <Shuffle size={10} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight">
                                    {quiz.title}
                                </h3>
                            </div>

                            {/* Card Body */}
                            <div className="px-8 py-5 space-y-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <FileText size={14} />
                                    <span>{quiz.sectionName || "Sin sección"}</span>
                                </div>

                                {quiz.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2">{quiz.description}</p>
                                )}
                            </div>

                            {/* Card Actions */}
                            <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}
                                        className="p-2 rounded-xl hover:bg-white transition-all text-slate-400 hover:text-blue-600"
                                        title={quiz.isPublished ? "Despublicar" : "Publicar"}
                                    >
                                        {quiz.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/admin/quizzes/${quiz.id}/results`)}
                                        className="p-2 rounded-xl hover:bg-white transition-all text-slate-400 hover:text-emerald-600"
                                        title="Ver resultados"
                                    >
                                        <BarChart3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => router.push(`/admin/quizzes/${quiz.id}/preview`)}
                                        className="p-2 rounded-xl hover:bg-white transition-all text-slate-400 hover:text-blue-600"
                                        title="Probar cuestionario"
                                    >
                                        <Play size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(quiz.id)}
                                        disabled={deletingId === quiz.id}
                                        className="p-2 rounded-xl hover:bg-white transition-all text-slate-400 hover:text-red-600 disabled:opacity-50"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => router.push(`/admin/quizzes/${quiz.id}`)}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                                >
                                    Editar
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
