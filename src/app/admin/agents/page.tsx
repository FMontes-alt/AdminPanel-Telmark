"use client"

import { useState, useEffect } from "react"
import { getAgents, deleteAgent } from "@/actions/users"
import { getSections } from "@/actions/sections"
import { AgentsList } from "./AgentsList"
import { AgentForm } from "./AgentForm"
import { AdminPageHeader } from "@/components/ui/admin-page-header"
import { Plus, Users, Loader2 } from "lucide-react"

export default function AgentsPage() {
    const [agents, setAgents] = useState<any[]>([])
    const [sections, setSections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingAgent, setEditingAgent] = useState<any>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [agentsData, sectionsData] = await Promise.all([
                getAgents(),
                getSections()
            ])
            setAgents(agentsData)
            setSections(sectionsData)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este empleado?")) return
        try {
            const result = await deleteAgent(id)
            if (result.success) fetchData()
        } catch (error) {
            console.error("Error deleting agent:", error)
        }
    }

    const handleEdit = (agent: any) => {
        setEditingAgent(agent)
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditingAgent(null)
    }

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            <AdminPageHeader
                category="Sistema"
                title={<>Gestión de <span className="text-blue-600">Empleados</span></>}
                description="Administra los accesos y permisos de las secciones para cada usuario."
            >
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                >
                    <Plus size={18} />
                    Nuevo Empleado
                </button>
            </AdminPageHeader>

            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <AgentForm
                        agent={editingAgent}
                        sections={sections}
                        onClose={handleCloseForm}
                        onSuccess={() => {
                            handleCloseForm()
                            fetchData()
                        }}
                    />
                </div>
            )}

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">Cargando nómina...</p>
                </div>
            ) : agents.length > 0 ? (
                <AgentsList
                    agents={agents}
                    sections={sections}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm border-dashed">
                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <Users size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">No hay empleados</h3>
                        <p className="text-sm text-slate-500">Comienza creando el primer perfil de acceso para el equipo.</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="text-blue-600 font-bold uppercase text-xs tracking-widest hover:underline"
                        >
                            Crear empleado ahora
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
