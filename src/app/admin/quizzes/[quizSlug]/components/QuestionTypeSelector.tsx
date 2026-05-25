"use client"

import { ListChecks, Check, ToggleLeft } from "lucide-react"

export const QUESTION_TYPES = [
    { value: "single_choice", label: "Opción Única", icon: ListChecks, description: "Una sola respuesta correcta" },
    { value: "multiple_choice", label: "Multi-Respuesta", icon: Check, description: "Varias respuestas correctas" },
    { value: "true_false", label: "Verdadero / Falso", icon: ToggleLeft, description: "Dos opciones" },
]

interface QuestionTypeSelectorProps {
    currentType: string
    onTypeChange: (type: string) => void
}

export default function QuestionTypeSelector({ currentType, onTypeChange }: QuestionTypeSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tipo de Pregunta</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {QUESTION_TYPES.map((qt) => (
                    <button
                        key={qt.value}
                        type="button"
                        onClick={() => onTypeChange(qt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                            currentType === qt.value
                                ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10"
                                : "border-slate-100 hover:border-slate-200 shadow-sm"
                        }`}
                    >
                        <qt.icon size={20} className={currentType === qt.value ? "text-blue-600" : "text-slate-400"} />
                        <span className={`text-[10px] font-black uppercase tracking-tight ${currentType === qt.value ? "text-blue-700" : "text-slate-500"}`}>
                            {qt.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
