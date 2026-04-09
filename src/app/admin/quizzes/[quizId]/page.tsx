"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getQuizById, updateQuiz, publishQuiz } from "@/actions/quizzes"
import { deleteQuestion } from "@/actions/quiz-questions"
import { getSections } from "@/actions/sections"

// Modular Components
import QuizEditorHeader from "./components/QuizEditorHeader"
import QuestionList from "./components/QuestionList"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"

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
        if (sectionsList) setSections(sectionsList)
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

    const triggerDeleteQuestion = (id: string) => {
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

    if (loading) return <div className="p-8 lg:p-12 space-y-8 max-w-[1000px] mx-auto animate-pulse"><div className="h-8 bg-slate-200 rounded-2xl w-48" /><div className="h-64 bg-slate-100 rounded-[32px]" /></div>
    if (!quiz) return <div className="p-8 lg:p-12 text-center py-24"><p className="text-slate-500 font-bold">Cuestionario no encontrado</p></div>

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-[1000px] mx-auto min-h-screen">
            <button
                onClick={() => router.push("/admin/quizzes")}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver a Cuestionarios
            </button>

            <QuizEditorHeader 
                editTitle={editTitle} setEditTitle={setEditTitle}
                editSectionId={editSectionId} setEditSectionId={setEditSectionId}
                editDescription={editDescription} setEditDescription={setEditDescription}
                editTimeLimit={editTimeLimit} setEditTimeLimit={setEditTimeLimit}
                editRandomize={editRandomize} setEditRandomize={setEditRandomize}
                sections={sections} quiz={quiz} saving={saving}
                onSaveSettings={handleSaveSettings} onTogglePublish={handleTogglePublish}
                onPreview={() => router.push(`/admin/quizzes/${quizId}/preview`)}
            />

            <QuestionList 
                quiz={quiz} quizId={quizId as string}
                showNewQuestion={showNewQuestion} setShowNewQuestion={setShowNewQuestion}
                editingQuestionId={editingQuestionId} setEditingQuestionId={setEditingQuestionId}
                fetchQuiz={fetchQuiz}
                onEdit={(id) => { setShowNewQuestion(false); setEditingQuestionId(id); }}
                onDelete={triggerDeleteQuestion}
            />

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
