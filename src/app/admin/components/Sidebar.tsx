"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { 
    LayoutDashboard, 
    Users, 
    BarChart3, 
    Eye, 
    ShieldAlert,
    PlusCircle,
    ClipboardList,
    FolderTree,
    Target
} from "lucide-react"
import { getAllSectionsAction } from "@/actions/sections"
import { getUnreadAlertsCount } from "@/actions/alerts"
import { createClient } from "@/lib/supabase/client"
import { useSidebar } from "./SidebarProvider"
import { SidebarLogo } from "./SidebarLogo"
import { SidebarNav, NavSection } from "./SidebarNav"
import { SidebarFooter } from "./SidebarFooter"

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
            <SidebarLogo isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <SidebarNav 
                isCollapsed={isCollapsed} 
                navSections={navSections} 
                collapsedSections={collapsedSections} 
                toggleSection={toggleSection} 
                isActive={isActive} 
                hasUnreadAlerts={hasUnreadAlerts} 
            />
            <SidebarFooter isCollapsed={isCollapsed} profile={profile} />
        </aside>
    )
}
