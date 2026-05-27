import { ArrowUpRight, CheckCircle2, Clock, PlayCircle } from "lucide-react"
import Link from "next/link"
import { AdminPageHeader } from "@/components/ui/admin-page-header"

export interface QuizAttemptItem {
    id: string
    quizTitle: string
    userName: string
    score: number | null
    maxScore: number | null
    status: 'in_progress' | 'pending_review' | 'completed'
    startedAt: string
}

interface RecentQuizAttemptsProps {
    attempts: QuizAttemptItem[]
}

export function RecentQuizAttempts({ attempts }: RecentQuizAttemptsProps) {
    const statusConfig = {
        in_progress: { label: 'En curso', color: 'text-blue-600 bg-blue-50', icon: PlayCircle },
        pending_review: { label: 'Revisión', color: 'text-orange-600 bg-orange-50', icon: Clock },
        completed: { label: 'Completado', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                category="Formación"
                title="Últimos Cuestionarios"
                description="Actividad reciente de los agentes en los quizzes."
                size="sm"
            >
                <Link href="/admin/quizzes/results">
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-all group">
                        Ver todos <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </Link>
            </AdminPageHeader>

            <div className="space-y-3">
                {attempts.map((attempt) => {
                    const StatusIcon = statusConfig[attempt.status].icon
                    return (
                        <div 
                            key={attempt.id} 
                            className="group flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${statusConfig[attempt.status].color}`}>
                                    <StatusIcon size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 line-clamp-1">{attempt.quizTitle}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-black uppercase tracking-widest">
                                            {attempt.userName}
                                        </span>
                                        {attempt.status === 'completed' && attempt.score !== null && attempt.maxScore !== null && (
                                            <span className="text-[10px] text-slate-500 font-bold">
                                                {attempt.score} / {attempt.maxScore} pts
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {new Date(attempt.startedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {(!attempts || attempts.length === 0) && (
                    <div className="py-12 text-center opacity-30">
                        <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin intentos recientes</p>
                    </div>
                )}
            </div>
        </div>
    )
}
