"use client"

import { ArrowLeft } from "lucide-react"
import { useState } from "react"

interface SubcategoryFormProps {
    onSubmit: (name: string) => Promise<void>
    onCancel: () => void
}

export default function SubcategoryForm({ onSubmit, onCancel }: SubcategoryFormProps) {
    const [name, setName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!name || isSubmitting) return
        setIsSubmitting(true)
        try {
            await onSubmit(name)
            setName("")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-blue-50/30 p-5 rounded-3xl border border-blue-100/50 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Añadir Subcategoría</span>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft size={16} />
                </button>
            </div>
            <div className="flex gap-3">
                <input 
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Documentación técnica..."
                    className="flex-1 bg-white border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button 
                    onClick={handleSubmit}
                    disabled={!name || isSubmitting}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? "Añadiendo..." : "Añadir"}
                </button>
            </div>
        </div>
    )
}
