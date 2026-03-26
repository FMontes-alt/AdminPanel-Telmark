import { DashboardHeader } from "./components/dashboard/DashboardHeader"
import { StatGrid } from "./components/dashboard/StatGrid"
import { RecentCampaignsList } from "./components/dashboard/RecentCampaignsList"
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
        supabase.from('sections').select('*').limit(3)
    ])

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            <DashboardHeader />
            
            <StatGrid 
                profilesCount={profilesCount || 0} 
                sectionsCount={sectionsCount || 0} 
                itemsCount={itemsCount || 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-12">
                <div className="lg:col-span-8">
                    <RecentCampaignsList sections={sections || []} />
                </div>
                
                <div className="lg:col-span-4">
                    <ActivityFeed activities={mockActivities} />
                </div>
            </div>
        </div>
    )
}


