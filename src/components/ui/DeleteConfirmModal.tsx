"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    isDeleting?: boolean
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isDeleting = false
}: DeleteConfirmModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Wrapper */}
                    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl shadow-slate-900/20 w-full max-w-md overflow-hidden pointer-events-auto border border-slate-100"
                        >
                            {/* Header with Icon */}
                            <div className="px-8 pt-10 pb-6 text-center space-y-4">
                                <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                                        <Trash2 className="text-red-500" size={28} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-8 pb-10 pt-4 flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        "Sí, Eliminar Permanentemente"
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    No, Cancelar Acción
                                </button>
                            </div>

                            {/* Close Button UI */}
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
