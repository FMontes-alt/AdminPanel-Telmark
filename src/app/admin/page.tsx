import { DashboardHeader } from "./components/dashboard/DashboardHeader"
import { QuickActions } from "./components/dashboard/QuickActions"
import { StatGrid } from "./components/dashboard/StatGrid"
import { RecentCampaignsList } from "./components/dashboard/RecentCampaignsList"
import { ActivityFeed, ActivityType } from "./components/dashboard/ActivityFeed"
import { RecentQuizzesList, QuizItem } from "./components/dashboard/RecentQuizzesList"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Fetch Real Data
    const [
        { count: profilesCount },
        { count: sectionsCount },
        { count: itemsCount },
        { count: quizzesCount },
        { count: alertsCount },
        { data: sections },
        { data: alerts },
        { data: recentQuizzes }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('sections').select('*', { count: 'exact', head: true }),
        supabase.from('items').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('alerts').select('*', { count: 'exact', head: true }),
        supabase.from('sections').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('alerts').select('*, profiles(first_name, last_name)').order('created_at', { ascending: false }).limit(6),
        supabase.from('quizzes').select('*').order('created_at', { ascending: false }).limit(4)
    ])

    // 2. Map Data
    const mappedActivities = (alerts || []).map((alert: any) => {
        let actionStr = 'registró un evento en'
        if (alert.type === 'create') actionStr = 'ha creado'
        else if (alert.type === 'edit') actionStr = 'ha modificado'
        else if (alert.type === 'delete') actionStr = 'ha eliminado'
        else if (alert.type === 'error') actionStr = 'reportó un error en'
        else if (alert.type === 'lock') actionStr = 'bloqueó'
        else if (alert.type === 'unlock') actionStr = 'desbloqueó'

        const userName = alert.profiles 
            ? `${alert.profiles.first_name} ${alert.profiles.last_name}`.trim() 
            : 'Sistema'

        const date = new Date(alert.created_at)
        const formattedTime = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        return {
            id: alert.id,
            type: alert.type as ActivityType,
            user: userName,
            action: actionStr,
            target: alert.target_name || alert.message || 'Elemento',
            time: formattedTime
        }
    })

    const mappedQuizzes: QuizItem[] = (recentQuizzes || []).map((quiz: any) => {
        return {
            id: quiz.id,
            title: quiz.title,
            slug: quiz.slug,
            isPublished: quiz.is_published,
            createdAt: quiz.created_at
        }
    })

    return (
        <div className="p-8 lg:p-12 space-y-8 max-w-[1400px] mx-auto min-h-screen bg-slate-50/30">
            <DashboardHeader />
            
            {/* Quick Actions Bar */}
            <QuickActions />

            {/* Interactive Stats Block */}
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
                <StatGrid 
                    profilesCount={profilesCount || 0} 
                    sectionsCount={sectionsCount || 0} 
                    itemsCount={itemsCount || 0}
                    quizzesCount={quizzesCount || 0}
                    alertsCount={alertsCount || 0}
                />
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
                        <RecentCampaignsList sections={sections || []} />
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100">
                        <RecentQuizzesList quizzes={mappedQuizzes} />
                    </div>
                </div>
                
                <div className="lg:col-span-4">
                    <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 h-full">
                        <ActivityFeed activities={mappedActivities} />
                    </div>
                </div>
            </div>
        </div>
    )
}
