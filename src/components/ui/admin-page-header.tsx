import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
    category: string
    title: ReactNode
    description: string
    children?: ReactNode
    className?: string
    size?: "sm" | "lg"
}

export function AdminPageHeader({ 
    category, 
    title, 
    description, 
    children, 
    className,
    size = "lg"
}: AdminPageHeaderProps) {
    const isSmall = size === "sm"

    return (
        <div className={cn("flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-slate-100", className)}>
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-8 h-1 rounded-full bg-blue-600/30", isSmall && "w-6 h-0.5")} />
                    <p className={cn("text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]", isSmall && "text-[8px]")}>{category}</p>
                </div>
                <h2 className={cn("font-bold text-slate-900 tracking-tighter leading-none", isSmall ? "text-2xl" : "text-5xl")}>
                    {title}
                </h2>
                <p className={cn("text-slate-400 font-medium", isSmall ? "text-xs mt-1" : "text-lg")}>{description}</p>
            </div>

            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    )
}
