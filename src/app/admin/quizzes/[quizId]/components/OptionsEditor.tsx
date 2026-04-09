"use client"

import { Check, X, Plus } from "lucide-react"

interface OptionsEditorProps {
    options: { id?: string; text: string; isCorrect: boolean }[]
    setOptions: (options: { id?: string; text: string; isCorrect: boolean }[]) => void
    type: string
}

export default function OptionsEditor({ options, setOptions, type }: OptionsEditorProps) {
    const toggleOptionCorrect = (index: number) => {
        const updated = [...options]
        if (type === "single_choice") {
            updated.forEach((o, i) => (o.isCorrect = i === index))
        } else {
            updated[index].isCorrect = !updated[index].isCorrect
        }
        setOptions(updated)
    }

    const updateOptionText = (index: number, val: string) => {
        const updated = [...options]
        updated[index].text = val
        setOptions(updated)
    }

    const addOption = () => setOptions([...options, { text: "", isCorrect: false }])
    
    const removeOption = (index: number) => {
        if (options.length <= 2) return
        setOptions(options.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Opciones de Respuesta
            </label>
            {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => toggleOptionCorrect(i)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                            opt.isCorrect
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-slate-100 text-slate-300 hover:bg-slate-200 shadow-sm"
                        }`}
                    >
                        <Check size={14} />
                    </button>
                    <input
                        value={opt.text}
                        onChange={(e) => updateOptionText(i, e.target.value)}
                        placeholder={`Opción ${i + 1}`}
                        className="flex-1 bg-slate-50 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                    />
                    {options.length > 2 && (
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
    )
}
