"use client"

import { motion } from "framer-motion"
import { GripVertical, Pencil, Trash2, Check, Image as ImageIcon, Video } from "lucide-react"

const QUESTION_TYPES = [
    { value: "single_choice", label: "Opción Única" },
    { value: "multiple_choice", label: "Multi-Respuesta" },
    { value: "true_false", label: "Verdadero / Falso" },
    { value: "short_answer", label: "Respuesta Corta" },
]

interface QuestionItemProps {
    question: any
    qIndex: number
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export default function QuestionItem({ question, qIndex, onEdit, onDelete }: QuestionItemProps) {
    return (
        <motion.div
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
                        onClick={() => onEdit(question.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(question.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
