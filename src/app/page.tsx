import { ShieldCheck, Flame, BellRing, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getSections } from "@/actions/sections"

export default async function Home() {
    const sections = await getSections()

    const getIcon = (slug: string) => {
        if (slug === 'adeslas') return <ShieldCheck size={48} className="text-blue-500" />
        if (slug === 'energia') return <Flame size={48} className="text-orange-500" />
        if (slug === 'alarma') return <BellRing size={48} className="text-purple-500" />
        return <ShieldCheck size={48} className="text-slate-400" />
    }

    const getColorClass = (slug: string) => {
        if (slug === 'adeslas') return 'hover:border-blue-200 hover:shadow-blue-500/10'
        if (slug === 'energia') return 'hover:border-orange-200 hover:shadow-orange-500/10'
        if (slug === 'alarma') return 'hover:border-purple-200 hover:shadow-purple-500/10'
        return 'hover:border-slate-200 hover:shadow-slate-500/10'
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="max-w-6xl w-full space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Bienvenido a <span className="text-blue-600 font-black">Telmark</span>
                    </h1>
                    <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto">
                        Selecciona un área para acceder a la información, servicios y documentación activa.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sections.map((section) => (
                        <Link 
                            key={section.id} 
                            href={`/dashboard/${section.slug}`}
                            className={`group bg-white p-10 rounded-[40px] border-2 border-slate-100 shadow-sm transition-all duration-500 flex flex-col items-center text-center space-y-6 hover:-translate-y-2 ${getColorClass(section.slug)} hover:shadow-2xl`}
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                {getIcon(section.slug)}
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{section.name}</h2>
                                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Módulo Activo</p>
                            </div>

                            <div className="pt-4 flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                                Entrar <ChevronRight size={20} />
                            </div>
                        </Link>
                    ))}

                    {sections.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium italic">No hay secciones configuradas actualmente.</p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center">
                    <p className="text-xs text-slate-300 font-bold tracking-widest uppercase">
                        Plataforma de Gestión Telmark &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    )
}
