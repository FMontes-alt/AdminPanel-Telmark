"use client"

import { useState, useEffect } from "react"
import { getGroups, deleteGroup, getGroupById } from "@/actions/groups"
import { getAgents } from "@/actions/users"
import { getHierarchy } from "@/actions/permissions"
import { GroupsList } from "./GroupsList"
import { GroupForm } from "./GroupForm"
import { AdminPageHeader } from "@/components/ui/admin-page-header"
import { Plus, FolderTree, Loader2, Search } from "lucide-react"

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [hierarchy, setHierarchy] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState<any>(null)
    const [loadingGroup, setLoadingGroup] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [groupsData, usersData, hierarchyData] = await Promise.all([
                getGroups(),
                getAgents(),
                getHierarchy()
            ])
            setGroups(groupsData)
            setUsers(usersData)
            setHierarchy(hierarchyData)
        } catch (error) {
            console.error("Error fetching groups data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este grupo? Los usuarios no serán eliminados.")) return
        try {
            const result = await deleteGroup(id)
            if (result.success) fetchData()
        } catch (error) {
            console.error("Error deleting group:", error)
        }
    }

    const handleEdit = async (group: any) => {
        setLoadingGroup(true)
        try {
            const fullGroup = await getGroupById(group.id)
            setEditingGroup(fullGroup)
            setIsFormOpen(true)
        } catch (error) {
            console.error("Error fetching group details:", error)
        } finally {
            setLoadingGroup(false)
        }
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditingGroup(null)
    }

    const filteredGroups = groups.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen">
            <AdminPageHeader
                category="Sistema"
                title={<>Gestión de <span className="text-blue-600">Grupos</span></>}
                description="Organiza a tus usuarios en grupos y asigna permisos colectivos fácilmente."
            >
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                >
                    <Plus size={18} />
                    Nuevo Grupo
                </button>
            </AdminPageHeader>

            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <GroupForm
                        group={editingGroup}
                        users={users}
                        hierarchy={hierarchy}
                        onClose={handleCloseForm}
                        onSuccess={() => {
                            handleCloseForm()
                            fetchData()
                        }}
                    />
                </div>
            )}

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Buscar grupos por nombre o descripción..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-200 transition-all shadow-sm"
                />
            </div>

            {loading || loadingGroup ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">{loadingGroup ? 'Preparando grupo...' : 'Cargando grupos...'}</p>
                </div>
            ) : filteredGroups.length > 0 ? (
                <GroupsList
                    groups={filteredGroups}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm border-dashed">
                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <FolderTree size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                            {searchTerm ? "No hay coincidencias" : "No hay grupos"}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {searchTerm ? "Intenta con otros términos de búsqueda." : "Comienza agrupando a tus usuarios para gestionar permisos masivos."}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="text-blue-600 font-bold uppercase text-xs tracking-widest hover:underline"
                            >
                                Crear grupo ahora
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
