import Link from "next/link"
import { Megaphone, GraduationCap, UserPlus, ShieldAlert, LucideIcon } from "lucide-react"

interface ActionItem {
    label: string
    description: string
    href: string
    icon: LucideIcon
    colorClass: string
    iconBgClass: string
}

const actions: ActionItem[] = [
    {
        label: "Nueva Campaña",
        description: "Crear sección",
        href: "/admin/sections?action=new",
        icon: Megaphone,
        colorClass: "group-hover:text-blue-600 hover:border-blue-100",
        iconBgClass: "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
    },
    {
        label: "Crear Quiz",
        description: "Añadir cuestionario",
        href: "/admin/quizzes?action=new",
        icon: GraduationCap,
        colorClass: "group-hover:text-indigo-600 hover:border-indigo-100",
        iconBgClass: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
    },
    {
        label: "Nuevo Agente",
        description: "Dar de alta usuario",
        href: "/admin/usuarios?action=new",
        icon: UserPlus,
        colorClass: "group-hover:text-emerald-600 hover:border-emerald-100",
        iconBgClass: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
    },
    {
        label: "Permisos",
        description: "Gestionar grupos",
        href: "/admin/grupos",
        icon: ShieldAlert,
        colorClass: "group-hover:text-orange-600 hover:border-orange-100",
        iconBgClass: "bg-orange-50 text-orange-600 group-hover:bg-orange-100"
    }
]

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, i) => {
                const Icon = action.icon
                return (
                    <Link key={i} href={action.href}>
                        <div className={`p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.01)] flex items-center gap-4 cursor-pointer transition-all duration-300 group ${action.colorClass}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${action.iconBgClass}`}>
                                <Icon size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 tracking-tighter transition-colors group-hover:text-inherit">{action.label}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 line-clamp-1">{action.description}</p>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
