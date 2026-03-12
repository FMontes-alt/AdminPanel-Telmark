"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

interface CategoryFormProps {
    onSubmit: (name: string) => Promise<void>
    onCancel: () => void
}

export default function CategoryForm({ onSubmit, onCancel }: CategoryFormProps) {
    const [name, setName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[32px] border border-blue-100/50 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-blue-500/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Plus size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">Nueva Categoría</h4>
                    <p className="text-xs text-slate-500">Define un nuevo grupo principal de información.</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input 
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Escribe el nombre de la categoría..."
                    className="flex-1 bg-white border-slate-200 rounded-2xl py-3.5 px-6 text-sm focus:ring-4 focus:ring-blue-500/10 transition-all border outline-none font-medium shadow-sm"
                />
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="bg-white text-slate-500 px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all border border-slate-200"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={!name || isSubmitting}
                        className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? "Creando..." : "Crear Categoría"}
                    </button>
                </div>
            </form>
        </div>
    )
}
