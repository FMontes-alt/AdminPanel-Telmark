"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    color: "blue" | "purple" | "emerald" | "red" | "amber"
    description: string
    danger?: boolean
}

export default function StatCard({ label, value, icon: Icon, color, description, danger = false }: StatCardProps) {
    const colors = {
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        emerald: "bg-emerald-100 text-emerald-600",
        red: "bg-red-100 text-red-600",
        amber: "bg-amber-100 text-amber-600"
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-white rounded-[32px] border p-8 space-y-6 shadow-sm transition-all ${danger ? 'border-red-200 bg-red-50/10' : 'border-slate-100 hover:shadow-xl hover:shadow-slate-100'}`}
        >
            <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                    <Icon size={28} />
                </div>
            </div>
            <div className="space-y-1 overflow-hidden">
                <p className={`font-black text-slate-900 tracking-tighter leading-none break-words ${
                    typeof value === 'string' && value.length > 10 ? 'text-2xl' : 'text-4xl'
                }`}>
                    {value}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">
                {description}
            </p>
        </motion.div>
    )
}
