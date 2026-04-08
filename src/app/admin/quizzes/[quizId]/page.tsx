"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    Check,
    X,
    Image as ImageIcon,
    Video,
    Type,
    ListChecks,
    ToggleLeft,
    AlignLeft,
    Save,
    Eye,
    EyeOff,
    Clock,
    Shuffle,
    ChevronDown,
    Play,
    Upload,
    Pencil,
} from "lucide-react"
import { getQuizById, updateQuiz, publishQuiz } from "@/actions/quizzes"
import { createQuestion, updateQuestion, deleteQuestion } from "@/actions/quiz-questions"
import { uploadFileAction, getSignedUrlAction } from "@/actions/storage"

const QUESTION_TYPES = [
    { value: "single_choice", label: "Opción Única", icon: ListChecks, description: "Una sola respuesta correcta" },
    { value: "multiple_choice", label: "Multi-Respuesta", icon: Check, description: "Varias respuestas correctas" },
    { value: "true_false", label: "Verdadero / Falso", icon: ToggleLeft, description: "Dos opciones" },
    { value: "short_answer", label: "Respuesta Corta", icon: AlignLeft, description: "Texto libre" },
]

export default function QuizEditorPage() {
    const { quizId } = useParams()
    const router = useRouter()
    const [quiz, setQuiz] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Editing state
    const [editTitle, setEditTitle] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editTimeLimit, setEditTimeLimit] = useState("")
    const [editRandomize, setEditRandomize] = useState(false)

    // New question form
    const [showNewQuestion, setShowNewQuestion] = useState(false)
    const [newQuestionText, setNewQuestionText] = useState("")
    const [newQuestionType, setNewQuestionType] = useState("single_choice")
    const [newQuestionMediaUrl, setNewQuestionMediaUrl] = useState("")
    const [newQuestionMediaType, setNewQuestionMediaType] = useState("none")
    const [newQuestionMaxSelections, setNewQuestionMaxSelections] = useState("2")
    const [newQuestionPoints, setNewQuestionPoints] = useState("1")
    const [newOptions, setNewOptions] = useState<{ text: string; isCorrect: boolean }[]>([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
    ])

    // Upload state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Editing question inline
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null)

    const fetchQuiz = useCallback(async () => {
        setLoading(true)
        const data = await getQuizById(quizId as string)
        if (data) {
            setQuiz(data)
            setEditTitle(data.title)
            setEditDescription(data.description || "")
            setEditTimeLimit(data.timeLimitMinutes?.toString() || "")
            setEditRandomize(data.randomizeQuestions)
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

    const handleAddQuestion = async () => {
        if (!newQuestionText.trim() || isSubmitting) return
        setIsSubmitting(true)

        let finalMediaUrl = newQuestionMediaUrl
        let finalMediaType = newQuestionMediaType

        try {
            if (selectedFile) {
                setUploadProgress(10)
                const formData = new FormData()
                formData.append('file', selectedFile)
                const result = await uploadFileAction(formData, "quizzes", quizId as string)
                finalMediaUrl = result.fullPath
                setUploadProgress(100)
            }

            const options = (newQuestionType === "single_choice" || newQuestionType === "multiple_choice")
                ? newOptions.filter(o => o.text.trim())
                : newQuestionType === "true_false"
                    ? [
                        { text: "Verdadero", isCorrect: newOptions[0]?.isCorrect || false },
                        { text: "Falso", isCorrect: newOptions[1]?.isCorrect || false },
                    ]
                    : []

            const questionData = {
                quizId: quizId as string,
                text: newQuestionText,
                type: newQuestionType as any,
                mediaUrl: finalMediaUrl || undefined,
                mediaType: (finalMediaUrl && finalMediaType !== "none") ? (finalMediaType as any) : "none",
                maxSelections: newQuestionType === "multiple_choice" ? parseInt(newQuestionMaxSelections) : undefined,
                points: parseInt(newQuestionPoints) || 1,
                options,
            }

            if (editingQuestionId) {
                await updateQuestion(editingQuestionId, questionData)
            } else {
                await createQuestion(questionData)
            }

            resetQuestionForm()
            await fetchQuiz()
        } catch (error) {
            console.error("Error creating/updating question:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetQuestionForm = () => {
        setEditingQuestionId(null)
        setNewQuestionText("")
        setNewQuestionType("single_choice")
        setNewQuestionMediaUrl("")
        setNewQuestionMediaType("none")
        setNewQuestionMaxSelections("2")
        setNewQuestionPoints("1")
        setNewOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }])
        setSelectedFile(null)
        setExistingMediaUrl(null)
        setUploadProgress(null)
        setShowNewQuestion(false)
    }

    const openEditQuestion = async (q: any) => {
        setEditingQuestionId(q.id)
        setNewQuestionText(q.text)
        setNewQuestionType(q.type)
        setNewQuestionMediaUrl(q.mediaUrl || "")
        setNewQuestionMediaType(q.mediaType || "none")
        setNewQuestionMaxSelections(q.maxSelections?.toString() || "2")
        setNewQuestionPoints(q.points?.toString() || "1")
        setNewOptions(q.options?.length > 0 ? [...q.options] : [{ text: "", isCorrect: false }, { text: "", isCorrect: false }])
        setSelectedFile(null)
        setUploadProgress(null)
        setExistingMediaUrl(null)

        if (q.mediaUrl && q.mediaType !== "none") {
            if (q.mediaUrl.startsWith('http')) {
                setExistingMediaUrl(q.mediaUrl)
            } else {
                try {
                    const url = await getSignedUrlAction(q.mediaUrl)
                    setExistingMediaUrl(url)
                } catch (e) {
                    console.error("Error resolving editing media:", e)
                }
            }
        }

        setShowNewQuestion(true)
    }

    const handleDeleteQuestion = async (questionId: string) => {
        await deleteQuestion(questionId)
        await fetchQuiz()
    }

    const addOption = () => {
        setNewOptions([...newOptions, { text: "", isCorrect: false }])
    }

    const removeOption = (index: number) => {
        if (newOptions.length <= 2) return
        setNewOptions(newOptions.filter((_, i) => i !== index))
    }

    const updateOptionText = (index: number, text: string) => {
        const updated = [...newOptions]
        updated[index].text = text
        setNewOptions(updated)
    }

    const toggleOptionCorrect = (index: number) => {
        const updated = [...newOptions]
        if (newQuestionType === "single_choice" || newQuestionType === "true_false") {
            // Solo una correcta
            updated.forEach((o, i) => (o.isCorrect = i === index))
        } else {
            updated[index].isCorrect = !updated[index].isCorrect
        }
        setNewOptions(updated)
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Descripción</label>
                            <input
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Opcional..."
                                className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-medium text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                            />
                        </div>
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
                        onClick={() => setShowNewQuestion(!showNewQuestion)}
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
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-[32px] border-2 border-blue-100 shadow-lg shadow-blue-500/5 overflow-hidden"
                        >
                            <div className="px-8 py-5 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center">
                                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">
                                    {editingQuestionId ? "Editar Pregunta" : "Nueva Pregunta"}
                                </h3>
                                <button onClick={resetQuestionForm} className="text-blue-400 hover:text-blue-600 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                {/* Question Type Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tipo de Pregunta</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {QUESTION_TYPES.map((qt) => (
                                            <button
                                                key={qt.value}
                                                type="button"
                                                onClick={() => {
                                                    setNewQuestionType(qt.value)
                                                    if (qt.value === "true_false") {
                                                        setNewOptions([
                                                            { text: "Verdadero", isCorrect: true },
                                                            { text: "Falso", isCorrect: false },
                                                        ])
                                                    } else if (qt.value === "short_answer") {
                                                        setNewOptions([])
                                                    } else {
                                                        if (newOptions.length < 2) {
                                                            setNewOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }])
                                                        }
                                                    }
                                                }}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                                                    newQuestionType === qt.value
                                                        ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10"
                                                        : "border-slate-100 hover:border-slate-200"
                                                }`}
                                            >
                                                <qt.icon size={20} className={newQuestionType === qt.value ? "text-blue-600" : "text-slate-400"} />
                                                <span className={`text-[10px] font-black uppercase tracking-tight ${newQuestionType === qt.value ? "text-blue-700" : "text-slate-500"}`}>
                                                    {qt.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Texto de la Pregunta</label>
                                    <textarea
                                        value={newQuestionText}
                                        onChange={(e) => setNewQuestionText(e.target.value)}
                                        placeholder="Escribe aquí la pregunta..."
                                        rows={2}
                                        className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-medium text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all resize-none"
                                    />
                                </div>

                                {/* Media Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            Imagen o Video (opcional)
                                        </label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${selectedFile ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                hidden
                                                accept="image/*,video/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        if (file.size > 50 * 1024 * 1024) return alert("Máximo 50MB")
                                                        setSelectedFile(file)
                                                        if (file.type.startsWith('image/')) setNewQuestionMediaType('image')
                                                        else if (file.type.startsWith('video/')) setNewQuestionMediaType('video')
                                                    }
                                                }}
                                            />
                                            {selectedFile ? (
                                                <>
                                                    <div className="p-3 bg-white rounded-full text-green-600 shadow-sm">
                                                        <Upload size={20} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold text-green-700">{selectedFile.name}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedFile(null)
                                                            if (!existingMediaUrl) {
                                                                setNewQuestionMediaType("none")
                                                                setNewQuestionMediaUrl("")
                                                            }
                                                        }}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700"
                                                    >
                                                        Quitar archivo
                                                    </button>
                                                </>
                                            ) : existingMediaUrl ? (
                                                <>
                                                    <div className="w-full max-h-32 rounded-xl overflow-hidden mb-2 relative group/preview">
                                                        {newQuestionMediaType === 'image' ? (
                                                            <img src={existingMediaUrl} alt="Preview" className="w-full h-full object-contain bg-slate-100" />
                                                        ) : (
                                                            <div className="w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400">
                                                                <Video size={32} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Cambiar archivo</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setExistingMediaUrl(null)
                                                            setNewQuestionMediaUrl("")
                                                            setNewQuestionMediaType("none")
                                                        }}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700"
                                                    >
                                                        Eliminar multimedia
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-white rounded-full text-slate-400 shadow-sm">
                                                        <Upload size={20} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold text-slate-600">Haz clic para subir un archivo</p>
                                                        <p className="text-[10px] text-slate-400">Imágenes o Video (Max. 50MB)</p>
                                                    </div>
                                                </>
                                            )}
                                            {uploadProgress !== null && (
                                                <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tipo de Media</label>
                                        <select
                                            value={newQuestionMediaType}
                                            onChange={(e) => setNewQuestionMediaType(e.target.value)}
                                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                                        >
                                            <option value="none">Ninguno</option>
                                            <option value="image">Imagen</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Points and Max Selections */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Puntos</label>
                                        <input
                                            value={newQuestionPoints}
                                            onChange={(e) => setNewQuestionPoints(e.target.value)}
                                            type="number"
                                            min="1"
                                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                    {newQuestionType === "multiple_choice" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                Máx. Selecciones
                                            </label>
                                            <input
                                                value={newQuestionMaxSelections}
                                                onChange={(e) => setNewQuestionMaxSelections(e.target.value)}
                                                type="number"
                                                min="2"
                                                className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Options Editor */}
                                {(newQuestionType === "single_choice" || newQuestionType === "multiple_choice") && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            Opciones de Respuesta
                                        </label>
                                        {newOptions.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleOptionCorrect(i)}
                                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                                                        opt.isCorrect
                                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                            : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                                                    }`}
                                                    title={opt.isCorrect ? "Correcta" : "Marcar como correcta"}
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <input
                                                    value={opt.text}
                                                    onChange={(e) => updateOptionText(i, e.target.value)}
                                                    placeholder={`Opción ${i + 1}`}
                                                    className="flex-1 bg-slate-50 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                                                />
                                                {newOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(i)}
                                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Añadir Opción
                                        </button>
                                    </div>
                                )}

                                {/* True/False Options */}
                                {newQuestionType === "true_false" && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            ¿Cuál es la respuesta correcta?
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewOptions([
                                                    { text: "Verdadero", isCorrect: true },
                                                    { text: "Falso", isCorrect: false },
                                                ])}
                                                className={`py-4 rounded-2xl font-bold text-sm transition-all ${
                                                    newOptions[0]?.isCorrect
                                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                            >
                                                Verdadero
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewOptions([
                                                    { text: "Verdadero", isCorrect: false },
                                                    { text: "Falso", isCorrect: true },
                                                ])}
                                                className={`py-4 rounded-2xl font-bold text-sm transition-all ${
                                                    newOptions[1]?.isCorrect
                                                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                            >
                                                Falso
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={handleAddQuestion}
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Guardando..." : editingQuestionId ? "Actualizar Pregunta" : "Guardar Pregunta"}
                                    </button>
                                    <button
                                        onClick={resetQuestionForm}
                                        className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Question List */}
                <div className="space-y-4">
                    {quiz.questions?.map((question: any, qIndex: number) => (
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qIndex * 0.05 }}
                            className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
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
                                    {/* Show options */}
                                    {question.options && question.options.length > 0 && (
                                        <div className="mt-3 space-y-1.5">
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
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => openEditQuestion(question)}
                                        className="p-2 text-slate-300 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
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
                                onClick={() => {
                                    resetQuestionForm()
                                    setShowNewQuestion(true)
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                            >
                                <Plus size={14} />
                                Añadir Primera Pregunta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
