import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { profiles, sections } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import Link from "next/link"
import { LayoutDashboard, LogOut, ChevronRight } from "lucide-react"

import { LogoutButton } from "@/components/auth/LogoutButton"

export default async function DashboardPage() {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() {}
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
    })

    if (!profile) redirect('/login')

    const sectionIds = profile.assignedSectionIds || []
    
    if (sectionIds.length === 0) {
        redirect('/')
    }

    // Obtener detalles de las secciones asignadas
    const assignedSections = await db.select().from(sections).where(inArray(sections.id, sectionIds))

    if (assignedSections.length === 1) {
        redirect(`/dashboard/${assignedSections[0].slug}`)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/30 mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <LayoutDashboard className="text-white w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase sm:text-5xl">
                            Hola, <span className="text-blue-600 font-black">{profile.firstName}</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                            Selecciona una sección para continuar
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignedSections.map((section) => (
                        <Link 
                            key={section.id} 
                            href={`/dashboard/${section.slug}`}
                            className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-100 transition-all duration-500 flex flex-col justify-between aspect-square md:aspect-auto md:min-h-[240px] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 ease-out" />
                            
                            <div className="relative z-10 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                <LayoutDashboard size={24} />
                            </div>

                            <div className="relative z-10 space-y-2 mt-8">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase group-hover:text-blue-600 transition-colors">
                                    {section.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Entrar al dashboard
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-center">
                    <LogoutButton variant="link" />
                </div>
            </div>
        </div>
    )
}
