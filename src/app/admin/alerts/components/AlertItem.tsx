"use client"

import {
    Bell,
    AlertCircle,
    Trash2,
    Lock,
    Unlock,
    Plus,
    Edit3,
    Zap,
    Clock,
    ChevronRight,
    ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"

interface AlertItemProps {
    alert: any
    onMarkAsRead: (id: string) => void
    index: number
}

export function AlertItem({ alert, onMarkAsRead, index }: AlertItemProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "delete": return <Trash2 size={16} />
            case "lock": return <Lock size={16} />
            case "unlock": return <Unlock size={16} />
            case "error": return <AlertCircle size={16} />
            case "create": return <Plus size={16} />
            case "edit": return <Edit3 size={16} />
            default: return <Bell size={16} />
        }
    }

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case "critical": return "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/10"
            case "warning": return "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10"
            default: return "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/10"
        }
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group flex items-center gap-6 p-6 rounded-[35px] border transition-all duration-500 relative overflow-hidden ${alert.isRead
                    ? "bg-slate-50/50 border-transparent text-slate-400"
                    : "bg-white border-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/10"
                }`}
        >
            {/* Icon Container */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${getSeverityStyles(alert.severity)}`}>
                {getIcon(alert.type)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                    <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${alert.isRead ? 'text-slate-300' : 'text-blue-600'}`}>
                        {alert.type}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock size={10} />
                        <p className="text-[10px] font-semibold">
                            {typeof alert.createdAt === 'string' || alert.createdAt instanceof Date
                                ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })
                                : 'hace un momento'}
                        </p>
                    </div>
                </div>
                <h4 className={`text-base font-bold tracking-tight lowercase first-letter:uppercase ${alert.isRead ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-600'} transition-colors`}>
                    {alert.message}
                </h4>
                <div className="flex items-center gap-4">
                    {alert.targetName && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                            <Zap size={10} className="text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{alert.targetName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                {alert.targetUrl && (
                    <Link
                        href={alert.targetUrl}
                        className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <ExternalLink size={12} />
                        Ver
                    </Link>
                )}
                {!alert.isRead && (
                    <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
                    >
                        Entendido
                    </button>
                )}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200">
                    <ChevronRight size={20} />
                </div>
            </div>

            {/* Unread indicator dot */}
            {!alert.isRead && (
                <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50"></div>
            )}
        </motion.div>
    )
}
