import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelRightOpen } from "lucide-react"

interface SidebarLogoProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function SidebarLogo({ isCollapsed, toggleSidebar }: SidebarLogoProps) {
    return (
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
    )
}
