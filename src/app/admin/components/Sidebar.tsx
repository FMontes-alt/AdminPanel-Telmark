"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
    LayoutDashboard, 
    Phone, 
    Users, 
    BarChart3, 
    Eye, 
    Settings,
    History,
    Activity,
    ShieldAlert,
    Network,
    ShieldCheck,
    Flame,
    BellRing
} from "lucide-react"

const campaigns = [
    { name: 'Adeslas', slug: 'adeslas', icon: ShieldCheck, color: 'text-blue-400' },
    { name: 'Energía', slug: 'energia', icon: Flame, color: 'text-orange-400' },
    { name: 'Alarmas', slug: 'alarmas', icon: BellRing, color: 'text-purple-400' },
]

export function Sidebar() {
    const pathname = usePathname()
    const isActive = (path: string) => pathname === path

    const sections = [
        {
            group: "Central",
            items: [
                { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
                { name: 'Alertas', href: '/admin/alerts', icon: ShieldAlert },
            ]
        },
        {
            group: "Llamadas",
            items: [
                { name: 'En Tiempo Real', href: '/admin/calls/live', icon: Activity },
                { name: 'Historial', href: '/admin/calls/history', icon: History },
            ]
        },
        {
            group: "Operativa",
            items: [
                { name: 'Agentes', href: '/admin/agents', icon: Users },
                { name: 'Monitoreo', href: '/admin/monitoring', icon: Eye },
                { name: 'Analíticas', href: '/admin/analytics', icon: BarChart3 },
            ]
        },
        {
            group: "Campañas",
            items: campaigns.map(c => ({
                name: c.name,
                href: `/admin/campaign/${c.slug}`,
                icon: c.icon,
                iconColor: c.color
            }))
        },
        {
            group: "Soporte",
            items: [
                { name: 'Configuración IVR', href: '/admin/settings/ivr', icon: Network },
                { name: 'Ajustes', href: '/admin/settings', icon: Settings },
            ]
        }
    ]

    return (
        <aside className="hidden lg:flex w-72 flex-col bg-slate-900 border-r border-slate-800 sticky top-0 h-screen z-20 text-slate-300">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-800 bg-slate-900">
                <Link href="/admin" className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-slate-700">
                        <Image 
                            src="/cropped-Logo_ColectivoPrime-284x284.png" 
                            alt="Telmark Logo" 
                            width={32} 
                            height={32} 
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            Telmark <span className="text-blue-500">Center</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Control Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                {sections.map((group) => (
                    <div key={group.group}>
                        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-4">
                            {group.group}
                        </p>
                        <div className="space-y-1.5">
                            {group.items.map((item) => (
                                <Link 
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                                        isActive(item.href) 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <item.icon size={18} className={isActive(item.href) ? 'text-white' : item.iconColor || 'text-slate-500 group-hover:text-blue-400'} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Access Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                        F
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">Administrador</p>
                        <p className="text-[10px] text-slate-500 truncate">Fran Montes</p>
                    </div>
                    <Settings size={14} className="text-slate-500 hover:text-white cursor-pointer" />
                </div>
            </div>
        </aside>
    )
}

