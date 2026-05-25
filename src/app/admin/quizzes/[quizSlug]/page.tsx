"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getQuizWithDetailsBySlug, getQuizzes, updateQuiz, publishQuiz } from "@/actions/quizzes"
import { deleteQuestion } from "@/actions/quiz-questions"
import { getAllSectionsAction } from "@/actions/sections"

// Modular Components
import QuizEditorHeader from "./components/QuizEditorHeader"
import QuestionList from "./components/QuestionList"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import { AdminPageHeader } from "@/components/ui/admin-page-header"

export default function QuizEditorPage() {
    const { quizSlug } = useParams()
    const router = useRouter()
    const [quiz, setQuiz] = useState<any>(null)
    const [sections, setSections] = useState<any[]>([])
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Quiz Settings state
    const [editTitle, setEditTitle] = useState("")
    const [editSectionId, setEditSectionId] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editImagePath, setEditImagePath] = useState("")
    const [editTimeLimit, setEditTimeLimit] = useState("")
    const [editRandomize, setEditRandomize] = useState(false)
    const [editPassingScore, setEditPassingScore] = useState(80)
    const [editRequiredQuizId, setEditRequiredQuizId] = useState("")

    // Editor state
    const [showNewQuestion, setShowNewQuestion] = useState(false)
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchQuiz = useCallback(async () => {
        setLoading(true)
        const [quizData, sectionsList, quizzesList] = await Promise.all([
            getQuizWithDetailsBySlug(quizSlug as string),
            getAllSectionsAction(),
            getQuizzes()
        ])
        
        if (quizData) {
            setQuiz(quizData)
            setEditTitle(quizData.title)
            setEditSectionId(quizData.sectionId)
            setEditDescription(quizData.description || "")
            setEditImagePath(quizData.imagePath || "")
            setEditTimeLimit(quizData.timeLimitMinutes?.toString() || "")
            setEditRandomize(quizData.randomizeQuestions)
            setEditPassingScore(quizData.passingScore)
            setEditRequiredQuizId(quizData.requiredQuizId || "")
        }
        if (sectionsList) setSections(sectionsList)
        if (quizzesList) setQuizzes(quizzesList)
        setLoading(false)
    }, [quizSlug])

    useEffect(() => {
        fetchQuiz()
    }, [fetchQuiz])

    const handleSaveSettings = async () => {
        if (!quiz) return
        setSaving(true)
        const res = await updateQuiz(quiz.id, {
            title: editTitle,
            sectionId: editSectionId,
            description: editDescription || undefined,
            imagePath: editImagePath || null,
            timeLimitMinutes: editTimeLimit ? parseInt(editTimeLimit) : null,
            randomizeQuestions: editRandomize,
            passingScore: editPassingScore,
            requiredQuizId: editRequiredQuizId || null,
        })
        if (res?.success && res.data) {
            if (res.data.slug !== quizSlug) {
                router.push(`/admin/quizzes/${res.data.slug}`)
            } else {
                await fetchQuiz()
            }
        } else {
            await fetchQuiz()
        }
        setSaving(false)
    }

    const handleTogglePublish = async () => {
        if (!quiz) return
        await publishQuiz(quiz.id, !quiz.isPublished)
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

            <AdminPageHeader
                category="Editor"
                title={<>Editar <span className="text-blue-600">{quiz.title}</span></>}
                description={`${quiz.questions?.length || 0} pregunta${(quiz.questions?.length || 0) !== 1 ? "s" : ""} configurada${(quiz.questions?.length || 0) !== 1 ? "s" : ""}`}
                size="sm"
            />

            <QuizEditorHeader 
                editTitle={editTitle} setEditTitle={setEditTitle}
                editSectionId={editSectionId} setEditSectionId={setEditSectionId}
                editDescription={editDescription} setEditDescription={setEditDescription}
                editImagePath={editImagePath} setEditImagePath={setEditImagePath}
                editTimeLimit={editTimeLimit} setEditTimeLimit={setEditTimeLimit}
                editRandomize={editRandomize} setEditRandomize={setEditRandomize}
                editPassingScore={editPassingScore} setEditPassingScore={setEditPassingScore}
                editRequiredQuizId={editRequiredQuizId} setEditRequiredQuizId={setEditRequiredQuizId}
                sections={sections} quizzes={quizzes} quiz={quiz} saving={saving}
                onSaveSettings={handleSaveSettings} onTogglePublish={handleTogglePublish}
                onPreview={() => router.push(`/admin/quizzes/${quiz.slug}/preview`)}
            />

            <QuestionList 
                quiz={quiz} quizId={quiz.id}
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
