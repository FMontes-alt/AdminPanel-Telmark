"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteAgent, getAgentById } from "@/actions/users"
import { AgentsList } from "./AgentsList"
import { AgentForm } from "./AgentForm"
import { AdminPageHeader } from "@/components/ui/admin-page-header"
import { Plus, Users, Loader2 } from "lucide-react"

export function UsuariosClient({
    initialAgents,
    initialSections,
    initialGroups,
    initialHierarchy,
    initialIsFormOpen = false
}: {
    initialAgents: any[]
    initialSections: any[]
    initialGroups: any[]
    initialHierarchy: any[]
    initialIsFormOpen?: boolean
}) {
    const [agents, setAgents] = useState<any[]>(initialAgents)
    const [isFormOpen, setIsFormOpen] = useState(initialIsFormOpen)
    const [editingAgent, setEditingAgent] = useState<any>(null)
    const [loadingAgent, setLoadingAgent] = useState(false)

    // Solo se usa si es necesario refrescar (e.g. tras crear/editar/eliminar)
    // Pero como estamos usando revalidatePath en las actions, tal vez Next.js 
    // recargue la página. Por si acaso, se puede hacer refresh con router.refresh() 
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return
        try {
            const result = await deleteAgent(id)
            if (result.success) {
                router.refresh()
            }
        } catch (error) {
            console.error("Error deleting agent:", error)
        }
    }

    const handleEdit = async (agent: any) => {
        setLoadingAgent(true)
        try {
            const fullAgent = await getAgentById(agent.id)
            setEditingAgent(fullAgent)
            setIsFormOpen(true)
        } catch (error) {
            console.error("Error fetching agent details:", error)
        } finally {
            setLoadingAgent(false)
        }
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditingAgent(null)
    }

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            <AdminPageHeader
                category="Sistema"
                title={<>Gestión de <span className="text-blue-600">Usuarios</span></>}
                description="Administra los accesos y permisos de las secciones para cada usuario."
            >
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                >
                    <Plus size={18} />
                    Nuevo Usuario
                </button>
            </AdminPageHeader>

            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <AgentForm
                        agent={editingAgent}
                        sections={initialSections}
                        groups={initialGroups}
                        hierarchy={initialHierarchy}
                        onClose={handleCloseForm}
                        onSuccess={() => {
                            handleCloseForm()
                            router.refresh()
                        }}
                    />
                </div>
            )}

            {loadingAgent ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">Cargando detalles...</p>
                </div>
            ) : agents.length > 0 ? (
                <AgentsList
                    agents={agents}
                    sections={initialSections}
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
