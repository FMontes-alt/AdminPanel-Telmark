import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
    category: string
    title: ReactNode
    description: string
    children?: ReactNode
    className?: string
}

export function AdminPageHeader({ 
    category, 
    title, 
    description, 
    children, 
    className 
}: AdminPageHeaderProps) {
    return (
        <div className={cn("flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-slate-100", className)}>
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-1 rounded-full bg-blue-600/30" />
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">{category}</p>
                </div>
                <h2 className="text-5xl font-bold text-slate-900 tracking-tighter leading-none">
                    {title}
                </h2>
                <p className="text-slate-400 font-medium text-lg">{description}</p>
            </div>

            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    )
}
