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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Hoy</span>
            </div>

            <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
                {activities.map((item) => {
                    const { icon: Icon, color } = activityIcons[item.type]
                    return (
                        <div key={item.id} className="relative flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 shrink-0 ${color}`}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    <span className="font-bold text-slate-800">{item.user}</span>
                                    {' '}{item.action}{' '}
                                    <span className="font-semibold text-slate-700">{item.target}</span>
                                </p>
                                <span className="text-[10px] font-medium text-slate-400 mt-1 block uppercase tracking-wide">
                                    {item.time}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
