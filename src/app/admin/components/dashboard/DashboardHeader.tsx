import { Zap } from "lucide-react"

export function DashboardHeader() {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-1 rounded-full bg-blue-600/30" />
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Overview</p>
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                    Panel de <span className="text-blue-600">Control</span>
                </h2>
                <p className="text-slate-400 font-medium text-lg">Gestiona tus campañas y contenidos en tiempo real.</p>
            </div>
        </div>
    )
}
