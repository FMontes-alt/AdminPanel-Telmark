"use client"

import { ArrowLeft } from "lucide-react"
import { useState } from "react"

interface ItemFormProps {
    onSubmit: (data: { title: string, contentType: "info" | "document" | "file" | "link", body: string }) => Promise<void>
    onCancel: () => void
}

export default function ItemForm({ onSubmit, onCancel }: ItemFormProps) {
    const [formData, setFormData] = useState({
        title: "",
        contentType: "info" as "info" | "document" | "file" | "link",
        body: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!formData.title || isSubmitting) return
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
            setFormData({ title: "", contentType: "info", body: "" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white p-5 rounded-3xl border border-blue-100 mb-5 space-y-4 shadow-xl shadow-blue-500/5 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
                <h5 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Nuevo Contenido</h5>
                <button onClick={onCancel} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <ArrowLeft size={16} />
                </button>
            </div>
            <div className="space-y-3">
                <input 
                    autoFocus
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Título llamativo..."
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                    {(['info', 'document', 'file', 'link'] as const).map(type => (
                        <button 
                            key={type}
                            onClick={() => setFormData({...formData, contentType: type})}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${formData.contentType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {type.toUpperCase()}
                        </button>
                    ))}
                </div>
                <textarea 
                    value={formData.body}
                    onChange={e => setFormData({...formData, body: e.target.value})}
                    placeholder="Desarrolla el contenido aquí..."
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-sm outline-none min-h-[100px] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Descartar
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={!formData.title || isSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : "Guardar Contenido"}
                </button>
            </div>
        </div>
    )
}
