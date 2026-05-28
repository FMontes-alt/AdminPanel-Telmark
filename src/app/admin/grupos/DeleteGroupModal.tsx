import { useState } from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface DeleteGroupModalProps {
    group: any;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export function DeleteGroupModal({ group, onClose, onConfirm, isDeleting }: DeleteGroupModalProps) {
    const [confirmName, setConfirmName] = useState("")
    const isNameMatched = confirmName === group.name

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative">
                <button 
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Eliminar Grupo</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Esta acción es irreversible. El grupo <strong>{group.name}</strong> será eliminado permanentemente. Los usuarios que pertenecen a este grupo no serán eliminados, pero perderán los permisos asociados al mismo.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">
                            Escribe <span className="text-red-600 font-black">{group.name}</span> para confirmar
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                placeholder="Escribe el nombre exacto aquí..."
                                disabled={isDeleting}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!isNameMatched || isDeleting}
                            className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                "Eliminando..."
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    <span>Eliminar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
