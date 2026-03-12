"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    LayoutDashboard, 
    ShieldCheck, 
    Users, 
    Settings, 
    Flame, 
    Zap, 
    BellRing
} from "lucide-react"

const campaigns = [
    { name: 'Adeslas', slug: 'adeslas', icon: ShieldCheck, color: 'text-blue-600' },
    { name: 'Energía', slug: 'energia', icon: Flame, color: 'text-orange-600' },
    { name: 'Alarmas', slug: 'alarmas', icon: BellRing, color: 'text-purple-600' },
]

import Image from "next/image"

export function Sidebar() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-20">
            <div className="p-6 border-b border-slate-100">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden group">
                        <Image 
                            src="/cropped-Logo_ColectivoPrime-284x284.png" 
                            alt="Telmark Logo" 
                            width={40} 
                            height={40} 
                            className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">
                            Telmark
                        </h2>
                        <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase -mt-1">CMS</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-8 overflow-y-auto">
                {/* General */}
                <div>
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Principal</p>
                    <div className="space-y-1">
                        <Link 
                            href="/admin" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                isActive('/admin') 
                                ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                        <Link 
                            href="/admin/users" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                isActive('/admin/users') 
                                ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <Users size={18} />
                            Usuarios
                        </Link>
                    </div>
                </div>

                {/* Campañas */}
                <div>
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Campañas</p>
                    <div className="space-y-1">
                        {campaigns.map((camp) => (
                            <Link 
                                key={camp.slug}
                                href={`/admin/campaign/${camp.slug}`}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                    pathname.includes(`/campaign/${camp.slug}`)
                                    ? 'bg-slate-100 text-slate-900 font-semibold' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <camp.icon size={18} className={camp.color} />
                                {camp.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer/Settings */}
                <div className="mt-auto pt-4 border-t border-slate-50">
                    <Link 
                        href="/admin/settings" 
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                        <Settings size={18} />
                        Configuración
                    </Link>
                </div>
            </nav>
        </aside>
    )
}
