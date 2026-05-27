import { ArrowUpRight, GraduationCap, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { AdminPageHeader } from "@/components/ui/admin-page-header"

export interface QuizItem {
    id: string
    title: string
    slug: string
    isPublished: boolean
    createdAt: string
}

interface RecentQuizzesListProps {
    quizzes: QuizItem[]
}

export function RecentQuizzesList({ quizzes }: RecentQuizzesListProps) {
    return (
        <div className="space-y-6">
            <AdminPageHeader
                category="Formación"
                title="Últimos Cuestionarios"
                description="Cuestionarios añadidos recientemente a la plataforma."
                size="sm"
            >
                <Link href="/admin/quizzes">
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-all group">
                        Ver todos <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </Link>
            </AdminPageHeader>

            <div className="space-y-3">
                {quizzes.map((quiz) => (
                    <div 
                        key={quiz.id} 
                        className="group flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm group-hover:shadow-md">
                                <GraduationCap size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{quiz.title}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    {quiz.isPublished ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle2 size={10} /> Publicado
                                        </span>
                                    ) : (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 font-black uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10} /> Borrador
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        {new Date(quiz.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/quizzes/${quiz.slug}`}>
                                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                    <ArrowUpRight size={18} />
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}

                {(!quizzes || quizzes.length === 0) && (
                    <div className="py-12 text-center opacity-30">
                        <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay cuestionarios recientes</p>
                    </div>
                )}
            </div>
        </div>
    )
}
