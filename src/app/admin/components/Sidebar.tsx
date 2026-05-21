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
    FolderTree,
    ChevronDown,
    PlusCircle,
    PanelLeftClose,
    PanelRightOpen,
    Menu,
    ClipboardList,
    Target
} from "lucide-react"
import { getAllSectionsAction } from "@/actions/sections"
import { getUnreadAlertsCount } from "@/actions/alerts"
import { createClient } from "@/lib/supabase/client"
import { useSidebar } from "./SidebarProvider"
import { Button } from "@/components/ui/button"

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
    return Target;
}

const getColorForSection = (name: string) => {
    return 'text-slate-400';
}

export function Sidebar() {
    const pathname = usePathname()
    const { isCollapsed, toggleSidebar } = useSidebar()
    const [collapsedSections, setCollapsedSections] = useState<string[]>([])
    const [dbSections, setDbSections] = useState<{name: string, slug: string}[]>([])
    const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; avatarUrl?: string; email?: string } | null>(null)
    const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false)

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('firstName, lastName, avatarUrl, email')
                    .eq('id', user.id)
                    .single()
                
                setProfile(data || { email: user.email })
            }
        }
        fetchUserData()
    }, [])

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const data = await getAllSectionsAction()
                setDbSections(data || [])
            } catch (error) {
                console.error("Error fetching sections for sidebar:", error)
            }
        }
        fetchSections()
    }, [])

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const count = await getUnreadAlertsCount()
                setHasUnreadAlerts(count > 0)
            } catch (error) {
                console.error("Error fetching unread status:", error)
            }
        }
        fetchUnread()
        
        // Polling cada 30 segundos
        const timer = setInterval(fetchUnread, 30000)
        return () => clearInterval(timer)
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
                { name: 'Inicio', href: '/admin', icon: LayoutDashboard },
                { name: 'Alertas', href: '/admin/alerts', icon: ShieldAlert },
            ]
        },
        {
            group: "Contenidos",
            items: [
                { name: 'Secciones', href: '/admin/sections', icon: PlusCircle },
                ...dbSections.map(s => ({
                    name: s.name,
                    href: `/admin/sections/${s.slug}`,
                    icon: getIconForSection(s.name),
                    iconColor: getColorForSection(s.name)
                })),
            ]
        },
        {
            group: "Operativa",
            items: [
                { name: 'Cuestionarios', href: '/admin/quizzes', icon: ClipboardList },
                { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
                { name: 'Grupos', href: '/admin/grupos', icon: FolderTree },
                { name: 'Monitoreo', href: '/admin/monitoring', icon: Eye },
                { name: 'Analíticas', href: '/admin/analytics', icon: BarChart3 },
            ]
        }
    ]

    return (
        <aside className={`transition-all duration-300 ease-in-out hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-20 text-slate-600 ${
            isCollapsed ? 'w-20' : 'w-72'
        }`}>
            {/* Logo Section & Toggle */}
            <div className={`border-b border-slate-200 bg-white min-h-[80px] flex items-center transition-all duration-300 ${isCollapsed ? 'p-4 justify-center flex-col gap-4' : 'p-6 justify-between'}`}>
                <Link href="/admin" className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 min-w-[40px] rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-slate-700">
                        <Image 
                            src="/cropped-Logo_ColectivoPrime-284x284.png" 
                            alt="Telmark Logo" 
                            width={32} 
                            height={32} 
                            className="object-contain"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="truncate">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                Colectivo <span className="text-blue-500">Prime</span>
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Control Panel</p>
                        </div>
                    )}
                </Link>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleSidebar}
                    className={`text-slate-400 hover:text-blue-600 h-8 w-8 transition-all ${isCollapsed ? 'mt-0' : ''}`}
                >
                    {isCollapsed ? <PanelRightOpen size={18} /> : <PanelLeftClose size={18} />}
                </Button>
            </div>


            {/* Navigation Section */}
            <nav className={`flex-1 space-y-8 overflow-y-auto custom-scrollbar px-4 pt-6 pb-10 ${isCollapsed ? 'overflow-x-hidden' : 'px-6'}`}>
                {navSections.map((group) => {
                    const isCollapsedSec = collapsedSections.includes(group.group)
                    
                    return (
                        <div key={group.group} className="space-y-4">
                            {!isCollapsed && (
                                <button 
                                    onClick={() => toggleSection(group.group)}
                                    className="w-full flex items-center justify-between px-3 group/btn"
                                >
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] transition-colors group-hover/btn:text-slate-600">
                                        {group.group}
                                    </p>
                                    <ChevronDown 
                                        size={12} 
                                        className={`text-slate-400 transition-transform duration-200 group-hover/btn:text-slate-600 ${isCollapsedSec ? '-rotate-90' : ''}`}
                                    />
                                </button>
                            )}
                            
                            {(!isCollapsedSec || isCollapsed) && (
                                <div className="space-y-1.5 transition-all duration-300">
                                    {group.items.map((item) => (
                                        <Link 
                                            key={item.name}
                                            href={item.href}
                                            title={isCollapsed ? item.name : undefined}
                                            className={`relative flex items-center rounded-xl text-sm font-semibold transition-all group ${
                                                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'
                                            } ${
                                                isActive(item.href) 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                                : 'hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <item.icon size={18} className={isActive(item.href) ? 'text-white' : item.iconColor || 'text-slate-400 group-hover:text-blue-600'} />
                                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                                            {item.name === 'Alertas' && hasUnreadAlerts && (
                                                <span className={`absolute flex h-2 w-2 ${isCollapsed ? 'top-1.5 right-1.5' : 'right-4'}`}>
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* User Access Footer */}
            <Link href="/admin/profile">
                <div className={`p-4 border-t border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-all cursor-pointer ${isCollapsed ? 'flex justify-center' : 'px-6'}`}>
                    <div className={`flex items-center gap-3 px-2 py-1 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 min-w-[32px] rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : profile?.firstName ? (
                                profile.firstName[0]
                            ) : profile?.email ? (
                                profile.email[0]
                            ) : (
                                'A'
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                    {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'Administrador'}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                    {profile?.email || 'Cargando...'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </aside>
    )
}
