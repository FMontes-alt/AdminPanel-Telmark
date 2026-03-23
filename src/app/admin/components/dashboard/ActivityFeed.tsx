import { 
    User, 
    FileEdit, 
    PlusCircle, 
    Trash2, 
    MessageCircle 
} from "lucide-react"

type ActivityType = 'create' | 'edit' | 'delete' | 'comment' | 'user'

interface ActivityItem {
    id: string
    type: ActivityType
    user: string
    action: string
    target: string
    time: string
}

const activityIcons: Record<ActivityType, any> = {
    create: { icon: PlusCircle, color: 'text-green-600 bg-green-50' },
    edit: { icon: FileEdit, color: 'text-blue-600 bg-blue-50' },
    comment: { icon: MessageCircle, color: 'text-purple-600 bg-purple-50' },
    delete: { icon: Trash2, color: 'text-red-600 bg-red-50' },
    user: { icon: User, color: 'text-slate-600 bg-slate-50' },
}

interface ActivityFeedProps {
    activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Actividad</h3>
                </div>
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Historial Completo</button>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
                {activities.map((item) => {
                    const { icon: Icon, color } = activityIcons[item.type]
                    return (
                        <div key={item.id} className="relative flex items-start gap-5 group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-slate-50 shadow-sm z-10 shrink-0 transition-transform duration-500 group-hover:scale-110 ${color}`}>
                                <Icon size={16} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm text-slate-500 leading-none font-medium mb-1.5 line-clamp-2">
                                    <span className="font-black text-slate-900">{item.user}</span>
                                    {' '}{item.action}{' '}
                                    <span className="font-bold text-blue-600">{item.target}</span>
                                </p>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em]">
                                    {item.time}
                                </span >
                            </div>
                        </div>
                    )
                })}

                {activities.length === 0 && (
                    <div className="py-12 text-center opacity-30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin actividad reciente</p>
                    </div>
                )}
            </div>
        </div>
    )
}
