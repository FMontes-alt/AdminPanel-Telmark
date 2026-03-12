"use client"

import { Trash2 } from "lucide-react"

interface DeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isDeleting: boolean
}

export default function DeleteModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">¿Estás seguro?</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    Esta acción no se puede deshacer. Se eliminará permanentemente este elemento y todo su contenido relacionado.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                    >
                        {isDeleting ? "Borrando..." : "Sí, borrar"}
                    </button>
                </div>
            </div>
        </div>
    )
}
