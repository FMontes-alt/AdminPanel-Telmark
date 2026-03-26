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
/*
### Session & Security Fix
Resolved the "infinite loop" and access issues in the admin panel.
- **Loop Prevention**: Fixed a bug where non-admin users were redirected to `/admin` repeatedly. Now they are sent back to the home page (`/`) safely.
- **Middleware Cleanup**: Streamlined the session refresh process to prevent redundant calls and ensure cookies are correctly synchronized.
- **Improved Logging**: Added a unique `x-trace-id` to every request for easier debugging of future access issues.
*/

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className={`group lg:grid lg:grid-cols-[48px_100px_1fr_150px_120px_160px] flex flex-col gap-4 lg:gap-4 p-4 lg:py-4 lg:px-6 rounded-2xl border border-l-4 transition-all duration-300 relative overflow-hidden ${alert.isRead
                    ? "bg-slate-50/50 border-slate-100 text-slate-400 border-l-transparent"
                    : "bg-white border-slate-200 shadow-sm hover:shadow-md border-l-blue-500"
                }`}
        >
            {/* 1. Icon Container (Column: Estado) */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${getSeverityStyles(alert.severity)}`}>
                {getIcon(alert.type)}
            </div>
 
            {/* 2. Type (Column: Tipo) */}
            <div className="flex items-center">
                <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-md ${
                    alert.isRead ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                }`}>
                    {alert.type}
                </span>
            </div>

            {/* 3. Message (Column: Mensaje) */}
            <div className="flex items-center min-w-0">
                <h4 className={`text-sm font-bold tracking-tight truncate ${alert.isRead ? 'text-slate-400' : 'text-slate-900'} transition-colors`}>
                    {alert.message}
                </h4>
            </div>

            {/* 4. Target (Column: Objetivo) */}
            <div className="flex items-center">
                {alert.targetName ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                        <Zap size={10} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{alert.targetName}</span>
                    </div>
                ) : (
                    <span className="text-[10px] text-slate-300 italic font-medium">Auto</span>
                )}
            </div>

            {/* 5. Date (Column: Fecha) */}
            <div className="flex items-center gap-1.5 text-slate-400">
                <Clock size={12} className="shrink-0" />
                <p className="text-[11px] font-bold">
                    {typeof alert.createdAt === 'string' || alert.createdAt instanceof Date
                        ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })
                        : 'hace poco'}
                </p>
            </div>

            {/* 6. Actions (Column: Acciones) */}
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                {alert.targetUrl && (
                    <Link
                        href={alert.targetUrl}
                        className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 flex items-center justify-center"
                        title="Ver detalle"
                    >
                        <ExternalLink size={14} />
                    </Link>
                )}
                {!alert.isRead && (
                    <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-slate-900/5 text-center flex-1"
                    >
                        Listo
                    </button>
                )}
                <div className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-slate-200">
                    <ChevronRight size={18} />
                </div>
            </div>

            {/* Unread indicator dot (only for mobile list look) */}
            {!alert.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 lg:hidden"></div>
            )}
        </motion.div>
    )
}
