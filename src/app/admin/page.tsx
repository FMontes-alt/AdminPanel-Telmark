import {
    Users,
    FileText,
    Zap,
    ArrowUpRight,
    Search,
    ShieldCheck,
    Flame,
    BellRing
} from "lucide-react"
import { StatCard } from "./components/dashboard/StatCard"
import { ActivityFeed } from "./components/dashboard/ActivityFeed"
import { createClient } from "@/lib/supabase/server"

// Datos de ejemplo para el "Feed" (ya que no hay tabla de logs todavía)
const mockActivities = [
    { id: '1', type: 'create' as const, user: 'Fran', action: 'ha creado una nueva sección en', target: 'Adeslas Salud', time: 'Hace 5 min' },
    { id: '2', type: 'edit' as const, user: 'Admin', action: 'ha modificado el ítem de formación en', target: 'Energía Solar', time: 'Hace 12 min' },
    { id: '3', type: 'user' as const, user: 'Sistema', action: 'ha dado de alta al nuevo agente:', target: 'Juan Pérez', time: 'Hace 1 hora' },
]

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Fetch Real Data
    const [
        { count: profilesCount },
        { count: sectionsCount },
        { count: itemsCount },
        { data: sections }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('sections').select('*', { count: 'exact', head: true }),
        supabase.from('items').select('*', { count: 'exact', head: true }),
        supabase.from('sections').select('*').limit(2)
    ])

    return (
        <div className="space-y-8">
            {/* Bienvenida y Búsqueda */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />

                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Panel de Control</h2>
                    <p className="text-slate-500 text-sm mt-1">Estado actual de la plataforma en tiempo real.</p>
                </div>

                <div className="relative z-10 max-w-md w-full">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar contenido..."
                            className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all border outline-none font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Grid de Estadísticas con Datos Reales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Campañas"
                    value={sectionsCount || 0}
                    icon={Zap}
                    color="blue"
                    description="Secciones configuradas"
                />
                <StatCard
                    title="Contenidos"
                    value={itemsCount || 0}
                    icon={FileText}
                    color="purple"
                    description="Ítems en el catálogo"
                />
                <StatCard
                    title="Personal"
                    value={profilesCount || 0}
                    icon={Users}
                    color="green"
                    description="Usuarios registrados"
                />
                <StatCard
                    title="Alertas"
                    value="0"
                    icon={BellRing}
                    color="orange"
                    description="Sin incidencias"
                />
            </div>

            {/* Contenido Secundario */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Secciones Recientes</h3>
                        <button className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                            Ver todas <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections?.map((section) => (
                            <div key={section.id} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {section.name.toLowerCase().includes('salud') || section.name.toLowerCase().includes('adeslas') ? <ShieldCheck size={24} /> : <Zap size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{section.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Activa</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                                    <span className="text-xs text-slate-500 font-medium italic">Creada: {new Date(section.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}

                        {(!sections || sections.length === 0) && (
                            <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 text-slate-400">
                                No hay campañas creadas todavía.
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <ActivityFeed activities={mockActivities} />
                </div>
            </div>
        </div>
    )
}


