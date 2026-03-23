import { useState } from "react"
import { AlertCircle, X, Trash2 } from "lucide-react"

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    targetName: string
    isDeleting: boolean
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, targetName, isDeleting }: DeleteConfirmModalProps) {
    const [inputValue, setInputValue] = useState("")

    if (!isOpen) return null

    const handleConfirm = () => {
        if (inputValue.toLowerCase() === targetName.toLowerCase()) {
            onConfirm()
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                <div className="p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
                            <AlertCircle size={28} />
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter uppercase mb-2">Eliminar Sección</h3>
                        <p className="text-slate-500 text-sm font-medium">Esta acción es irreversible. Se borrarán todos los datos vinculados.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escribe el nombre para confirmar:</p>
                            <p className="text-lg font-bold text-slate-900 select-none tracking-tight">{targetName}</p>
                        </div>

                        <input 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escribe el nombre aquí..."
                            className="w-full bg-white border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-4 px-6 text-sm transition-all outline-none font-bold text-slate-700 shadow-sm"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-50">
                        <button 
                            onClick={handleConfirm}
                            disabled={inputValue !== targetName || isDeleting}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                inputValue === targetName 
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <Trash2 size={16} className={isDeleting ? "animate-spin" : ""} />
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
