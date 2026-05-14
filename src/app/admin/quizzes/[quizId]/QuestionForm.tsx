"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { createQuestion, updateQuestion } from "@/actions/quiz-questions"
import { uploadFileAction, getSignedUrlAction } from "@/actions/storage"

// Sub-components
import QuestionTypeSelector from "./components/QuestionTypeSelector"
import MediaEditor from "./components/MediaEditor"
import OptionsEditor from "./components/OptionsEditor"
import TrueFalseEditor from "./components/TrueFalseEditor"

interface QuestionFormProps {
    quizId: string
    editingQuestion?: any
    onSuccess: () => void
    onCancel: () => void
    qIndex?: number
}

export default function QuestionForm({ 
    quizId, 
    editingQuestion, 
    onSuccess, 
    onCancel,
    qIndex 
}: QuestionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Form states
    const [text, setText] = useState(editingQuestion?.text || "")
    const [type, setType] = useState(editingQuestion?.type || "single_choice")
    const [mediaUrl, setMediaUrl] = useState(editingQuestion?.mediaUrl || "")
    const [mediaType, setMediaType] = useState(editingQuestion?.mediaType || "none")
    const [topic, setTopic] = useState(editingQuestion?.topic || "")
    const [maxSelections, setMaxSelections] = useState(editingQuestion?.maxSelections?.toString() || "2")
    const [points, setPoints] = useState(editingQuestion?.points?.toString() || "1")
    const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null)
    const [options, setOptions] = useState<{ id?: string; text: string; isCorrect: boolean }[]>(
        editingQuestion?.options?.map((o: any) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })) || 
        [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
    )
    const [referenceAnswer, setReferenceAnswer] = useState(
        (type === "short_answer" && editingQuestion?.options?.[0]?.text) || ""
    )

    useEffect(() => {
        const loadMedia = async () => {
            if (editingQuestion?.mediaUrl) {
                if (editingQuestion.mediaUrl.startsWith('http')) {
                    setExistingMediaUrl(editingQuestion.mediaUrl)
                } else {
                    const signedUrl = await getSignedUrlAction(editingQuestion.mediaUrl)
                    setExistingMediaUrl(signedUrl)
                }
            }
        }
        loadMedia()
    }, [editingQuestion])

    const handleSave = async () => {
        if (!text.trim() || isSubmitting) return
        setIsSubmitting(true)

        let finalMediaUrl = mediaUrl
        let finalMediaType = mediaType

        try {
            if (selectedFile) {
                setUploadProgress(10)
                const formData = new FormData()
                formData.append('file', selectedFile)
                const result = await uploadFileAction(formData, "quizzes", quizId, "media")
                finalMediaUrl = result.fullPath
                setUploadProgress(100)
            }

            const formattedOptions = (type === "single_choice" || type === "multiple_choice")
                ? options.filter(o => o.text.trim())
                : type === "true_false"
                    ? options.slice(0, 2)
                    : type === "short_answer" && referenceAnswer.trim()
                        ? [{ text: referenceAnswer.trim(), isCorrect: true }]
                        : []

            const questionData = {
                quizId,
                text,
                type: type as any,
                mediaUrl: finalMediaUrl || undefined,
                mediaType: (finalMediaUrl && finalMediaType !== "none") ? (finalMediaType as any) : "none",
                maxSelections: type === "multiple_choice" ? parseInt(maxSelections) : undefined,
                points: parseInt(points) || 1,
                topic: topic.trim() || undefined,
                options: formattedOptions,
            }

            if (editingQuestion) {
                await updateQuestion(editingQuestion.id, questionData)
            } else {
                await createQuestion(questionData)
            }

            onSuccess()
        } catch (error) {
            console.error("Error saving question:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={`bg-white rounded-[32px] border-2 border-blue-600 shadow-xl shadow-blue-500/10 overflow-hidden ${editingQuestion ? 'my-2' : 'my-4'}`}>
            <div className="px-8 py-5 bg-blue-600 border-b border-blue-600 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {editingQuestion && (
                        <span className="w-8 h-8 bg-white/20 text-white rounded-xl flex items-center justify-center text-xs font-black">
                            {qIndex !== undefined ? qIndex + 1 : "?"}
                        </span>
                    )}
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        {editingQuestion ? "Actualizar Pregunta" : "Nueva Pregunta"}
                    </h3>
                </div>
                <button onClick={onCancel} className="text-white/60 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
            
            <div className="p-8 space-y-6">
                <QuestionTypeSelector 
                    currentType={type} 
                    onTypeChange={(newType) => {
                        setType(newType)
                        if (newType === "true_false") {
                            setOptions([{ text: "Verdadero", isCorrect: true }, { text: "Falso", isCorrect: false }])
                        } else if (newType === "short_answer") {
                            setOptions([])
                        } else if (options.length < 2) {
                            setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }])
                        }
                    }} 
                />

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Texto de la Pregunta</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escribe aquí la pregunta..."
                        rows={2}
                        className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-medium text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all resize-none shadow-inner"
                    />
                </div>

                <MediaEditor 
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    mediaType={mediaType}
                    setMediaType={setMediaType}
                    existingMediaUrl={existingMediaUrl}
                    setExistingMediaUrl={setExistingMediaUrl}
                    setMediaUrl={setMediaUrl}
                    uploadProgress={uploadProgress}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Puntos</label>
                        <input
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            type="number"
                            min="1"
                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                    {type === "multiple_choice" && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Máx. Selecciones</label>
                            <input
                                value={maxSelections}
                                onChange={(e) => setMaxSelections(e.target.value)}
                                type="number"
                                min="2"
                                className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tema / Categoría</label>
                        <input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ej: Legales, Producto..."
                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Conditional Editors */}
                {(type === "single_choice" || type === "multiple_choice") && (
                    <OptionsEditor options={options} setOptions={setOptions} type={type} />
                )}

                {type === "true_false" && (
                    <TrueFalseEditor options={options} setOptions={setOptions} />
                )}

                {type === "short_answer" && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Respuesta de Referencia (Opcional)</label>
                        <input
                            value={referenceAnswer}
                            onChange={(e) => setReferenceAnswer(e.target.value)}
                            placeholder="Ej: La fotosíntesis..."
                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                        />
                        <p className="text-[10px] text-slate-400 italic">Esta respuesta servirá de guía al administrador durante la revisión manual.</p>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {isSubmitting ? "Guardando..." : "Guardar Pregunta"}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
