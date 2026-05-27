import { LucideIcon, Megaphone, Library, Users, Activity, GraduationCap } from "lucide-react"
import Link from "next/link"

interface StatItemProps {
    title: string
    value: string | number
    icon: LucideIcon
    color: "blue" | "purple" | "green" | "orange" | "indigo"
    description?: string
    href: string
}

function StatItem({ title, value, icon: Icon, color, description, href }: StatItemProps) {
    const bgColors = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
        green: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
        orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
    }

    return (
        <Link href={href} className="block">
            <div className="flex flex-col gap-3 group p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer h-full">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${bgColors[color]} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{value}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    </div>
                </div>
                {description && (
                    <p className="text-[10px] text-slate-400 font-bold px-1 line-clamp-1">{description}</p>
                )}
            </div>
        </Link>
    )
}

interface StatGridProps {
    sectionsCount: number
    itemsCount: number
    profilesCount: number
    quizzesCount: number
    alertsCount: number
}

export function StatGrid({ sectionsCount, itemsCount, profilesCount, quizzesCount, alertsCount }: StatGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
            <StatItem 
                title="Campañas" 
                value={sectionsCount} 
                icon={Megaphone} 
                color="blue" 
                description="Gestión de secciones"
                href="/admin/sections"
            />
            <StatItem 
                title="Contenidos" 
                value={itemsCount} 
                icon={Library} 
                color="purple" 
                description="Archivos globales"
                href="/admin/sections"
            />
            <StatItem 
                title="Personal" 
                value={profilesCount} 
                icon={Users} 
                color="green" 
                description="Agentes y usuarios"
                href="/admin/usuarios"
            />
            <StatItem 
                title="Formación" 
                value={quizzesCount} 
                icon={GraduationCap} 
                color="indigo" 
                description="Quizzes publicados"
                href="/admin/quizzes"
            />
            <StatItem 
                title="Alertas" 
                value={alertsCount} 
                icon={Activity} 
                color="orange" 
                description="Monitor de sistema"
                href="/admin/alerts"
            />
        </div>
    )
}
