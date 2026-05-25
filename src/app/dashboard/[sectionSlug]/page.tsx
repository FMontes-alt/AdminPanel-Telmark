"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useParams } from "next/navigation"
import { LayoutGrid, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getSectionBySlug } from "@/actions/sections"
import { getFilteredHierarchy } from "@/actions/hierarchy"
import { getPublishedQuizzes } from "@/actions/quizzes"
import AlertModal from "@/components/ui/AlertModal"

// Nuevos Componentes Refactorizados
import { SubcategoryViewer } from "@/components/dashboard/SubcategoryViewer"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default function DashboardSectionPage() {
    const { sectionSlug } = useParams()
    const [section, setSection] = useState<any>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [quizCount, setQuizCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
    const hasSeenErrorRef = useRef(false)

    useEffect(() => {
        fetchData()
    }, [sectionSlug])

    // Escucha activa de cambios (polling cada 5 segundos) para bloqueo en tiempo real
    useEffect(() => {
        if (!sectionSlug) return;
        
        const intervalId = setInterval(async () => {
            try {
                const currentSection = await getSectionBySlug(sectionSlug as string)
                if (currentSection) {
                    const newConfig = (currentSection.config as any) || {}
                    const oldConfig = (section?.config as any) || {}
                    
                    // Comprobar si hay un cambio en el estado de bloqueo
                    if (newConfig.isLocked !== oldConfig.isLocked) {
                        if (newConfig.isLocked) {
                            // Se acaba de bloquear -> actualizar estado para mostrar pantalla de Acceso Denegado al instante
                            setSection(currentSection)
                        } else {
                            // Se acaba de desbloquear -> refrescar datos completos para mostrar la sección sin recargar
                            fetchData()
                        }
                    } else {
                        // Si se activó un error, mostramos el modal sin recargar (solo 1 vez)
                        if (newConfig.hasError && !isErrorModalOpen && !hasSeenErrorRef.current) {
                            setIsErrorModalOpen(true)
                            hasSeenErrorRef.current = true
                        }
                        // Si se resolvió el error, quitamos el modal y reseteamos el rastreador por si vuelve a fallar
                        else if (!newConfig.hasError) {
                            if (isErrorModalOpen) setIsErrorModalOpen(false)
                            hasSeenErrorRef.current = false
                        }
                    }
                }
            } catch (error) {
                // Silencioso
            }
        }, 5000)

        return () => clearInterval(intervalId)
    }, [sectionSlug, section, isErrorModalOpen])

    const fetchData = async () => {
        setLoading(true)
        try {
            const currentSection = await getSectionBySlug(sectionSlug as string)
            if (currentSection) {
                setSection(currentSection)
                
                // Usamos la acción filtrada por permisos
                const catsWithSubs = await getFilteredHierarchy(currentSection.id)

                setCategories(catsWithSubs)
                if (catsWithSubs.length > 0) {
                    setSelectedCategoryId(catsWithSubs[0].id)
                }

                // Cargar el conteo de cuestionarios publicados
                const published = await getPublishedQuizzes(currentSection.id)
                setQuizCount(published.length)

                // Mostrar modal de error si está activo en la config
                if (currentSection.config && (currentSection.config as any).hasError && !hasSeenErrorRef.current) {
                    setIsErrorModalOpen(true)
                    hasSeenErrorRef.current = true
                }
            }
        } catch (error) {
            console.error("Error fetching dashboard content:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories
        return categories.map(cat => ({
            ...cat,
            subcategories: cat.subcategories.map((sub: any) => ({
                ...sub,
                items: sub.items.filter((item: any) =>
                    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            })).filter((sub: any) => sub.items.length > 0)
        })).filter(cat => cat.subcategories.length > 0)
    }, [categories, searchTerm])

    const activeCategory = useMemo(() => {
        return filteredCategories.find(c => c.id === selectedCategoryId) || (filteredCategories.length > 0 ? filteredCategories[0] : null)
    }, [filteredCategories, selectedCategoryId])

    if (loading) {
        return (
            <div className="h-screen bg-[#fafafa] flex overflow-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600">
                <DashboardSidebar 
                    section={section || { name: "Cargando..." }}
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={setSelectedCategoryId}
                    quizCount={quizCount || 1}
                    sectionSlug={sectionSlug as string}
                />

                <main className="flex-1 flex flex-col h-full bg-white relative">
                    <DashboardHeader 
                        sectionName={section?.name || "Cargando..."}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />

                    <div className="flex-1 flex items-center justify-center bg-[#fafafa]/50">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-lg" />
                            <div className="text-center space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Iniciando Protocolo</p>
                                <p className="text-sm font-bold text-slate-900 tracking-tight">Cargando Documentación...</p>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        )
    }

    if (!section) {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 text-center max-w-sm">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Info size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Error Crítico</h2>
                    <p className="text-slate-500 text-sm font-medium mb-8">No se ha podido localizar la unidad de negocio solicitada o no tienes permisos de acceso.</p>
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        Volver a Campañas
                    </button>
                </div>
            </div>
        )
    }

    if (section.config && (section.config as any).isLocked) {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 text-center max-w-sm">
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Info size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Acceso Denegado</h2>
                    <p className="text-slate-500 text-sm font-medium mb-8">Esta sección se encuentra bloqueada por completo. No tienes permiso para acceder en este momento.</p>
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        Volver a Campañas
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#fafafa] flex overflow-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600">
            {/* Navegación Lateral */}
            <DashboardSidebar 
                section={section}
                categories={filteredCategories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                quizCount={quizCount}
                sectionSlug={sectionSlug as string}
            />

            {/* Área de Contenido Principal */}
            <main className="flex-1 flex flex-col h-full bg-white relative">
                {/* Cabecera con Búsqueda */}
                <DashboardHeader 
                    sectionName={section.name}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                {/* Área de Scroll de Contenido Dinámico */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fafafa]/50">
                    <AnimatePresence mode="wait">
                        {activeCategory ? (
                            <motion.div
                                key={activeCategory.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                className="p-10 lg:p-16 space-y-16 max-w-[1600px]"
                            >
                                <div className="space-y-4 max-w-3xl">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px w-12 bg-blue-600" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Explorador de Recursos</span>
                                    </div>
                                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                                        {activeCategory.name}
                                    </h2>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">
                                        Consulta la documentación técnica, materiales de formación y recursos operativos de esta categoría.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-24">
                                    {activeCategory.subcategories?.map((sub: any) => (
                                        <SubcategoryViewer key={sub.id} sub={sub} />
                                    ))}
                                </div>
                                
                                {/* Footer de Página */}
                                <div className="pt-20 border-t border-slate-100 flex items-center justify-between opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                            <LayoutGrid size={18} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">End of Transmission — Colectivo Prime Campañas</p>
                                    </div>
                                    <div className="h-px flex-1 mx-10 bg-slate-100" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Encrypted Session — Secure Node</p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-12 text-center">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-md space-y-8"
                                >
                                    <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center mx-auto text-slate-200 shadow-inner relative group">
                                        <div className="absolute inset-0 bg-blue-600/5 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <LayoutGrid size={56} className="relative z-10" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Selecciona una Categoría</h3>
                                        <p className="text-base text-slate-500 font-medium leading-relaxed">
                                            Navega a través del panel lateral izquierdo para acceder a la base de conocimientos y herramientas disponibles.
                                        </p>
                                    </div>
                                    <div className="pt-8 flex justify-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AlertModal 
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                title="Aviso de Error"
                message="Existen una serie de errores en la configuración o recursos de esta sección. Es posible que algunas funcionalidades no operen correctamente."
                type="warning"
            />
            

        </div>
    )
}
