"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    Check,
    Image as ImageIcon,
    Video,
    Type,
    Save,
    Eye,
    EyeOff,
    Clock,
    Shuffle,
    Play,
    Pencil,
} from "lucide-react"
import { getQuizById, updateQuiz, publishQuiz } from "@/actions/quizzes"
import { deleteQuestion } from "@/actions/quiz-questions"
import { getSections } from "@/actions/sections"
import QuestionForm from "./QuestionForm"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"

const QUESTION_TYPES = [
    { value: "single_choice", label: "Opción Única" },
    { value: "multiple_choice", label: "Multi-Respuesta" },
    { value: "true_false", label: "Verdadero / Falso" },
    { value: "short_answer", label: "Respuesta Corta" },
]

export default function QuizEditorPage() {
    const { quizId } = useParams()
    const router = useRouter()
    const [quiz, setQuiz] = useState<any>(null)
    const [sections, setSections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Quiz Settings state
    const [editTitle, setEditTitle] = useState("")
    const [editSectionId, setEditSectionId] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editTimeLimit, setEditTimeLimit] = useState("")
    const [editRandomize, setEditRandomize] = useState(false)

    // Editor state
    const [showNewQuestion, setShowNewQuestion] = useState(false)
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchQuiz = useCallback(async () => {
        setLoading(true)
        const [quizData, sectionsList] = await Promise.all([
            getQuizById(quizId as string),
            getSections()
        ])
        
        if (quizData) {
            setQuiz(quizData)
            setEditTitle(quizData.title)
            setEditSectionId(quizData.sectionId)
            setEditDescription(quizData.description || "")
            setEditTimeLimit(quizData.timeLimitMinutes?.toString() || "")
            setEditRandomize(quizData.randomizeQuestions)
        }
        if (sectionsList) {
            setSections(sectionsList)
        }
        setLoading(false)
    }, [quizId])

    useEffect(() => {
        fetchQuiz()
    }, [fetchQuiz])

    const handleSaveSettings = async () => {
        setSaving(true)
        await updateQuiz(quizId as string, {
            title: editTitle,
            sectionId: editSectionId,
            description: editDescription || undefined,
            timeLimitMinutes: editTimeLimit ? parseInt(editTimeLimit) : null,
            randomizeQuestions: editRandomize,
        })
        await fetchQuiz()
        setSaving(false)
    }

    const handleTogglePublish = async () => {
        if (!quiz) return
        await publishQuiz(quizId as string, !quiz.isPublished)
        await fetchQuiz()
    }

    const triggerDeleteQuestion = (id: string | null) => {
        setItemToDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteQuestion = async () => {
        if (!itemToDeleteId) return
        setIsDeleting(true)
        await deleteQuestion(itemToDeleteId)
        setIsDeleting(false)
        setIsDeleteModalOpen(false)
        setItemToDeleteId(null)
        await fetchQuiz()
    }

    const openEditQuestion = (questionId: string) => {
        setShowNewQuestion(false)
        setEditingQuestionId(questionId)
    }

    const closeEditor = () => {
        setShowNewQuestion(false)
        setEditingQuestionId(null)
    }

    if (loading) {
        return (
            <div className="p-8 lg:p-12 space-y-8 max-w-[1000px] mx-auto animate-pulse">
                <div className="h-8 bg-slate-200 rounded-2xl w-48" />
                <div className="h-64 bg-slate-100 rounded-[32px]" />
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="p-8 lg:p-12 text-center py-24">
                <p className="text-slate-500 font-bold">Cuestionario no encontrado</p>
            </div>
        )
    }

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-[1000px] mx-auto min-h-screen">
            {/* Back Button */}
            <button
                onClick={() => router.push("/admin/quizzes")}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver a Cuestionarios
            </button>

            {/* Quiz Settings Card */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        Configuración
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/admin/quizzes/${quizId}/preview`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                        >
                            <Play size={14} />
                            Probar
                        </button>
                        <button
                            onClick={handleTogglePublish}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                quiz?.isPublished
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                        >
                            {quiz?.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                            {quiz?.isPublished ? "Publicado" : "Borrador"}
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Título</label>
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sección / Categoría</label>
                            <select
                                value={editSectionId}
                                onChange={(e) => setEditSectionId(e.target.value)}
                                className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                            >
                                <option value="">Selecciona sección...</option>
                                {sections.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Descripción</label>
                        <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Opcional..."
                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-medium text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                <Clock size={10} /> Tiempo Límite (min)
                            </label>
                            <input
                                value={editTimeLimit}
                                onChange={(e) => setEditTimeLimit(e.target.value)}
                                type="number"
                                min="1"
                                placeholder="Sin límite"
                                className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-2 flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 rounded-2xl py-3 px-5 w-full hover:bg-slate-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={editRandomize}
                                    onChange={(e) => setEditRandomize(e.target.checked)}
                                    className="w-4 h-4 rounded accent-blue-600"
                                />
                                <div className="flex items-center gap-1.5">
                                    <Shuffle size={12} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700">Aleatorio</span>
                                </div>
                            </label>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                <Save size={14} />
                                {saving ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        Preguntas ({quiz.questions?.length || 0})
                    </h2>
                    <button
                        onClick={() => {
                            setEditingQuestionId(null)
                            setShowNewQuestion(!showNewQuestion)
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                        <Plus size={14} />
                        Añadir Pregunta
                    </button>
                </div>

                {/* New Question Form */}
                <AnimatePresence>
                    {showNewQuestion && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <QuestionForm
                                quizId={quizId as string}
                                onSuccess={() => {
                                    setShowNewQuestion(false)
                                    fetchQuiz()
                                }}
                                onCancel={() => setShowNewQuestion(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Question List */}
                <div className="space-y-4">
                    {quiz.questions?.map((question: any, qIndex: number) => (
                        <div key={question.id}>
                            <AnimatePresence mode="wait">
                                {editingQuestionId === question.id ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <QuestionForm
                                            quizId={quizId as string}
                                            editingQuestion={question}
                                            qIndex={qIndex}
                                            onSuccess={() => {
                                                setEditingQuestionId(null)
                                                fetchQuiz()
                                            }}
                                            onCancel={() => setEditingQuestionId(null)}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: qIndex * 0.05 }}
                                        className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                                    >
                                        <div className="px-6 py-4 flex items-start gap-4">
                                            <div className="flex items-center gap-2 pt-1">
                                                <GripVertical size={16} className="text-slate-300 cursor-grab" />
                                                <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs font-black">
                                                    {qIndex + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{question.text}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                                                        {QUESTION_TYPES.find(t => t.value === question.type)?.label || question.type}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-blue-500">
                                                        {question.points} pt{question.points > 1 ? "s" : ""}
                                                    </span>
                                                    {question.mediaUrl && (
                                                        <span className="text-[9px] font-bold text-purple-500 flex items-center gap-1">
                                                            {question.mediaType === "image" ? <ImageIcon size={10} /> : <Video size={10} />}
                                                            Media
                                                        </span>
                                                    )}
                                                    {question.type === "multiple_choice" && question.maxSelections && (
                                                        <span className="text-[9px] font-bold text-amber-500">
                                                            Máx: {question.maxSelections}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Options Summary */}
                                                {question.options && question.options.length > 0 && (
                                                    <div className="mt-3 space-y-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {question.options.map((opt: any) => (
                                                            <div
                                                                key={opt.id}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
                                                                    opt.isCorrect
                                                                        ? "bg-emerald-50 text-emerald-700 font-bold"
                                                                        : "bg-slate-50 text-slate-500"
                                                                }`}
                                                            >
                                                                {opt.isCorrect && <Check size={12} className="text-emerald-500" />}
                                                                {opt.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditQuestion(question.id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => triggerDeleteQuestion(question.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    {(!quiz.questions || quiz.questions.length === 0) && !showNewQuestion && (
                        <div className="text-center py-16 space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-[20px] flex items-center justify-center mx-auto">
                                <Type size={28} className="text-slate-300" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 uppercase">Sin Preguntas</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Añade preguntas para completar el cuestionario.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowNewQuestion(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                            >
                                <Plus size={14} />
                                Añadir Primera Pregunta
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteQuestion}
                title="¿Eliminar Pregunta?"
                description="Esta acción eliminará permanentemente la pregunta y todas sus opciones de respuesta. No se puede deshacer."
            />
        </div>
    )
}
