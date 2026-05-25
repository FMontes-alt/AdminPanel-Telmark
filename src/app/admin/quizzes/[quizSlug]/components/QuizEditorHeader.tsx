"use client"

import { Play, Eye, EyeOff, Clock, Shuffle, Save } from "lucide-react"
import { ResolvedStorageImage } from "@/components/ui/resolved-storage-image"

interface QuizEditorHeaderProps {
    editTitle: string
    setEditTitle: (v: string) => void
    editSectionId: string
    setEditSectionId: (v: string) => void
    editDescription: string
    setEditDescription: (v: string) => void
    editImagePath: string
    setEditImagePath: (v: string) => void
    editTimeLimit: string
    setEditTimeLimit: (v: string) => void
    editRandomize: boolean
    setEditRandomize: (v: boolean) => void
    editPassingScore: number
    setEditPassingScore: (v: number) => void
    editRequiredQuizId: string
    setEditRequiredQuizId: (v: string) => void
    sections: any[]
    quizzes: any[]
    quiz: any
    saving: boolean
    onSaveSettings: () => void
    onTogglePublish: () => void
    onPreview: () => void
}

export default function QuizEditorHeader({
    editTitle, setEditTitle,
    editSectionId, setEditSectionId,
    editDescription, setEditDescription,
    editImagePath, setEditImagePath,
    editTimeLimit, setEditTimeLimit,
    editRandomize, setEditRandomize,
    editPassingScore, setEditPassingScore,
    editRequiredQuizId, setEditRequiredQuizId,
    sections, quizzes, quiz, saving,
    onSaveSettings, onTogglePublish, onPreview
}: QuizEditorHeaderProps) {
    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Configuración
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onPreview}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                    >
                        <Play size={14} />
                        Probar
                    </button>
                    <button
                        onClick={onTogglePublish}
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

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Imagen (Storage Path o URL)</label>
                    <div className="flex gap-4">
                        <input
                            value={editImagePath}
                            onChange={(e) => setEditImagePath(e.target.value)}
                            placeholder="ej: quizzes/portada.webp o https://..."
                            className="flex-1 bg-slate-50 rounded-2xl py-3 px-5 text-sm font-medium text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                        />
                        {editImagePath && (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm">
                                <ResolvedStorageImage
                                    src={editImagePath}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Puntuación de Aprobación (%)</label>
                        <input
                            value={editPassingScore}
                            onChange={(e) => setEditPassingScore(parseInt(e.target.value) || 0)}
                            type="number"
                            min="0"
                            max="100"
                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cuestionario Previo Requerido</label>
                        <select
                            value={editRequiredQuizId}
                            onChange={(e) => setEditRequiredQuizId(e.target.value)}
                            className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                        >
                            <option value="">Ninguno (Disponible de inmediato)</option>
                            {quizzes
                                .filter((q) => q.sectionId === editSectionId && q.id !== quiz.id)
                                .map((q) => (
                                    <option key={q.id} value={q.id}>{q.title}</option>
                                ))}
                        </select>
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
                            onClick={onSaveSettings}
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
    )
}
