"use client"

import { useState, useEffect } from "react"
import { getAlerts, markAlertAsRead, deleteAllAlerts } from "@/actions/alerts"
import { AlertsHeader } from "./components/AlertsHeader"
import { AlertsFilters } from "./components/AlertsFilters"
import { AlertsList } from "./components/AlertsList"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    
    // Estados para el Modal de Confirmación
    const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false)
    const [isDeletingAll, setIsDeletingAll] = useState(false)

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

    const handleClearAllClick = () => {
        setIsClearAllModalOpen(true)
    }

    const handleClearAllConfirm = async () => {
        try {
            setIsDeletingAll(true)
            await deleteAllAlerts()
            setAlerts([])
            setIsClearAllModalOpen(false)
        } catch (error) {
            console.error("Error deleting all alerts:", error)
        } finally {
            setIsDeletingAll(false)
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
                onClearAll={handleClearAllClick}
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
            
            <DeleteConfirmModal
                isOpen={isClearAllModalOpen}
                onClose={() => setIsClearAllModalOpen(false)}
                onConfirm={handleClearAllConfirm}
                title="Limpiar Alertas"
                description="¿Estás seguro de que quieres eliminar todo el historial de alertas de forma permanente? Esta acción no se puede deshacer."
                isDeleting={isDeletingAll}
            />
        </div>
    )
}
