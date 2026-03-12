"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { useState, useEffect } from "react"
import { 
    LayoutDashboard, 
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
    BellRing,
    ChevronDown,
    PlusCircle,
    FolderTree
} from "lucide-react"
import { getSections } from "@/lib/actions/cms"

interface NavItem {
    name: string;
    href: string;
    icon: any;
    iconColor?: string;
}

interface NavSection {
    group: string;
    items: NavItem[];
}

const getIconForSection = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('adeslas') || lowerName.includes('salud')) return ShieldCheck;
    if (lowerName.includes('energia') || lowerName.includes('luz')) return Flame;
    if (lowerName.includes('alarma')) return BellRing;
    return FolderTree;
}

const getColorForSection = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('adeslas') || lowerName.includes('salud')) return 'text-blue-400';
    if (lowerName.includes('energia') || lowerName.includes('luz')) return 'text-orange-400';
    if (lowerName.includes('alarma')) return 'text-purple-400';
    return 'text-slate-400';
}

export function Sidebar() {
    const pathname = usePathname()
    const [collapsedSections, setCollapsedSections] = useState<string[]>([])
    const [dbSections, setDbSections] = useState<{name: string, slug: string}[]>([])

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const data = await getSections()
                setDbSections(data || [])
            } catch (error) {
                console.error("Error fetching sections for sidebar:", error)
            }
        }
        fetchSections()
    }, [])

    const toggleSection = (group: string) => {
        setCollapsedSections(prev => 
            prev.includes(group) 
                ? prev.filter(s => s !== group) 
                : [...prev, group]
        )
    }

    const isActive = (path: string) => {
        if (path === '/admin' || path === '/admin/sections') return pathname === path
        return pathname === path || pathname.startsWith(path + '/')
    }

    const navSections: NavSection[] = [
        {
            group: "Central",
            items: [
                { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
                { name: 'Alertas', href: '/admin/alerts', icon: ShieldAlert },
            ]
        },
        {
            group: "Contenidos",
            items: [
                { name: 'Gestionar Secciones', href: '/admin/sections', icon: PlusCircle },
                ...dbSections.map(s => ({
                    name: s.name,
                    href: `/admin/sections/${s.slug}`,
                    icon: getIconForSection(s.name),
                    iconColor: getColorForSection(s.name)
                }))
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
            group: "Llamadas",
            items: [
                { name: 'En Tiempo Real', href: '/admin/calls/live', icon: Activity },
                { name: 'Historial', href: '/admin/calls/history', icon: History },
            ]
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
        <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-20 text-slate-600">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-200 bg-white">
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
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            Telmark <span className="text-blue-500">Center</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Control Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                {navSections.map((group) => {
                    const isCollapsed = collapsedSections.includes(group.group)
                    
                    return (
                        <div key={group.group} className="space-y-4">
                            <button 
                                onClick={() => toggleSection(group.group)}
                                className="w-full flex items-center justify-between px-3 group/btn"
                            >
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] transition-colors group-hover/btn:text-slate-600">
                                    {group.group}
                                </p>
                                <ChevronDown 
                                    size={12} 
                                    className={`text-slate-400 transition-transform duration-200 group-hover/btn:text-slate-600 ${isCollapsed ? '-rotate-90' : ''}`}
                                />
                            </button>
                            
                            {!isCollapsed && (
                                <div className="space-y-1.5 transition-all duration-300">
                                    {group.items.map((item) => (
                                        <Link 
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                                                isActive(item.href) 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                                : 'hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <item.icon size={18} className={isActive(item.href) ? 'text-white' : item.iconColor || 'text-slate-400 group-hover:text-blue-600'} />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* User Access Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                        F
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Administrador</p>
                        <p className="text-[10px] text-slate-400 truncate">Fran Montes</p>
                    </div>
                    <Settings size={14} className="text-slate-400 hover:text-blue-600 cursor-pointer" />
                </div>
            </div>
        </aside>
    )
}

