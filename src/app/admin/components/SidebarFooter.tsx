import Link from "next/link"

interface Profile {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    email?: string;
}

interface SidebarFooterProps {
    isCollapsed: boolean;
    profile: Profile | null;
}

export function SidebarFooter({ isCollapsed, profile }: SidebarFooterProps) {
    return (
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
    )
}
