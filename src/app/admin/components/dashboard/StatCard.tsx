import { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: string
        isUp: boolean
    }
    color?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, color = "blue" }: StatCardProps) {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        orange: "text-orange-600 bg-orange-50 border-orange-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        green: "text-green-600 bg-green-50 border-green-100",
    }

    const selectedColor = colorClasses[color] || colorClasses.blue

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${selectedColor}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        trend.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                {description && (
                    <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">{description}</p>
                )}
            </div>
        </div>
    )
}
