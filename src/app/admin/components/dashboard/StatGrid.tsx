import { LucideIcon, Zap, FileText, Users, BellRing } from "lucide-react"

interface StatItemProps {
    title: string
    value: string | number
    icon: LucideIcon
    color: "blue" | "purple" | "green" | "orange"
    description?: string
}

function StatItem({ title, value, icon: Icon, color, description }: StatItemProps) {
    const bgColors = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600",
    }

    return (
        <div className="flex flex-col gap-3 group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${bgColors[color]} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                </div>
            </div>
            {description && (
                <p className="text-[10px] text-slate-400 font-bold px-1 line-clamp-1">{description}</p>
            )}
        </div>
    )
}

interface StatGridProps {
    sectionsCount: number
    itemsCount: number
    profilesCount: number
}

export function StatGrid({ sectionsCount, itemsCount, profilesCount }: StatGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-10 border-y border-slate-100">
            <StatItem 
                title="Campañas" 
                value={sectionsCount} 
                icon={Zap} 
                color="blue" 
                description="Secciones activas"
            />
            <StatItem 
                title="Contenidos" 
                value={itemsCount} 
                icon={FileText} 
                color="purple" 
                description="Archivos y guías"
            />
            <StatItem 
                title="Personal" 
                value={profilesCount} 
                icon={Users} 
                color="green" 
                description="Agentes registrados"
            />
            <StatItem 
                title="Alertas" 
                value={0} 
                icon={BellRing} 
                color="orange" 
                description="Sistema operativo"
            />
        </div>
    )
}
