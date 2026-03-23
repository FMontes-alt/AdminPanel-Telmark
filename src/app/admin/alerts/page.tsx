"use client"

import { useState, useEffect } from "react"
import { getAlerts, markAlertAsRead } from "@/actions/alerts"
import { AlertsHeader } from "./components/AlertsHeader"
import { AlertsFilters } from "./components/AlertsFilters"
import { AlertsList } from "./components/AlertsList"

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchAlerts()
    }, [])

    const fetchAlerts = async () => {
        setLoading(true)
        try {
            const data = await getAlerts()
            setAlerts(data || [])
        } catch (error) {
            console.error("Error loading alerts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAlertAsRead(id)
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: new Date() } : a))
        } catch (error) {
            console.error("Error marking as read:", error)
        }
    }

    const filteredAlerts = alerts.filter(a => {
        const matchesFilter = filter === "all" || a.type === filter
        const matchesSearch = a.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.targetName?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const unreadCount = alerts.filter(a => !a.isRead).length
    const todayCount = alerts.filter(a => {
        const today = new Date().toDateString()
        return new Date(a.createdAt).toDateString() === today
    }).length

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            <AlertsHeader 
                alertCount={todayCount}
                unreadCount={unreadCount}
            />

            <AlertsFilters 
                filter={filter}
                setFilter={setFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <AlertsList 
                alerts={filteredAlerts}
                loading={loading}
                onMarkAsRead={handleMarkAsRead}
            />
        </div>
    )
}
