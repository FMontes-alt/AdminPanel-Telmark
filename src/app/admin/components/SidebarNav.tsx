import Link from "next/link"
import { ChevronDown } from "lucide-react"

interface NavItem {
    name: string;
    href: string;
    icon: any;
    iconColor?: string;
}

export interface NavSection {
    group: string;
    items: NavItem[];
}

interface SidebarNavProps {
    isCollapsed: boolean;
    navSections: NavSection[];
    collapsedSections: string[];
    toggleSection: (group: string) => void;
    isActive: (path: string) => boolean;
    hasUnreadAlerts: boolean;
}

export function SidebarNav({ 
    isCollapsed, 
    navSections, 
    collapsedSections, 
    toggleSection, 
    isActive, 
    hasUnreadAlerts 
}: SidebarNavProps) {
    return (
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
    )
}
