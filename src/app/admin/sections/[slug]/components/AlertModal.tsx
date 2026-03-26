"use client"

import { AlertCircle, X, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    type?: 'error' | 'info' | 'success' | 'warning'
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'error' }: AlertModalProps) {
    if (!isOpen) return null

    const icons = {
        error: <AlertCircle size={32} className="text-red-500" />,
        info: <Info size={32} className="text-blue-500" />,
        success: <CheckCircle2 size={32} className="text-green-500" />,
        warning: <AlertCircle size={32} className="text-orange-500" />
    }

    const bgColors = {
        error: "bg-red-50",
        info: "bg-blue-50",
        success: "bg-green-50",
        warning: "bg-orange-50"
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 relative">
                <button 
                    onClick={onClose}
                    className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors p-1"
                >
                    <X size={20} />
                </button>

                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6", bgColors[type])}>
                    {icons[type]}
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                    {message}
                </p>

                <button 
                    onClick={onClose}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    Entendido
                </button>
            </div>
        </div>
    )
}
