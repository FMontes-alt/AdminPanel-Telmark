"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { 
    ChevronRight, 
    FileText, 
    Download, 
    Link as LinkIcon, 
    Info, 
    ArrowLeft,
    Search,
    LayoutGrid,
    Target
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
    getSections, 
    getCategoriesBySection, 
    getSubcategoriesByCategory,
    getItemsBySubcategory
} from "@/lib/actions/cms"

export default function DashboardSectionPage() {
    const { sectionSlug } = useParams()
    const [section, setSection] = useState<any>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [sectionSlug])

    const fetchData = async () => {
        setLoading(true)
        try {
            const allSections = await getSections()
            const currentSection = allSections.find((s: any) => s.slug === sectionSlug)
            if (currentSection) {
                setSection(currentSection)
                const cats = await getCategoriesBySection(currentSection.id)
                
                const catsWithSubs = await Promise.all(cats.map(async (cat: any) => {
                    const subs = await getSubcategoriesByCategory(cat.id)
                    const subsWithItems = await Promise.all(subs.map(async (sub: any) => {
                        const its = await getItemsBySubcategory(sub.id)
                        return { ...sub, items: its }
                    }))
                    return { ...cat, subcategories: subsWithItems }
                }))
                
                setCategories(catsWithSubs)
                if (catsWithSubs.length > 0) {
                    setSelectedCategoryId(catsWithSubs[0].id)
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

    if (loading) return <div className="h-screen bg-slate-50 flex items-center justify-center p-8 animate-pulse text-slate-400 font-bold">Iniciando sistema...</div>
    if (!section) return <div className="h-screen bg-slate-50 flex items-center justify-center p-8 text-red-500 font-bold">Error: Sección no encontrada</div>

    return (
        <div className="h-screen bg-white flex overflow-hidden font-sans">
            {/* Left Sidebar - Categories Navigation */}
            <aside className="w-80 bg-slate-50 border-r border-slate-100 flex flex-col h-full">
                <div className="p-8 space-y-6">
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Inicio
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{section.name}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Centro de Información</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-1 custom-scrollbar">
                    {filteredCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                                selectedCategoryId === cat.id 
                                ? 'bg-white shadow-xl shadow-blue-500/5 text-blue-600 ring-1 ring-blue-500/10' 
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${selectedCategoryId === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                <LayoutGrid size={18} />
                            </div>
                            <span className="text-sm font-bold truncate">{cat.name}</span>
                        </button>
                    ))}
                    
                    {filteredCategories.length === 0 && (
                        <div className="p-8 text-center space-y-2">
                            <Info size={24} className="mx-auto text-slate-200" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No hay resultados</p>
                        </div>
                    )}
                </nav>

                <div className="p-6 bg-white border-t border-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Target size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase">Estado: ACTIVO</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Telmark Cloud v1.0</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-white relative">
                {/* Search Bar Fixed Top */}
                <header className="p-8 border-b border-slate-50 flex items-center justify-between gap-8 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
                    <div className="flex-1 max-w-2xl relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={`¿Qué información buscas en ${section.name}?`}
                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500/20 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none transition-all font-medium placeholder:text-slate-400"
                        />
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-slate-300">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-900 uppercase">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sincronizado</p>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                    <AnimatePresence mode="wait">
                        {activeCategory ? (
                            <motion.div 
                                key={activeCategory.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="p-8 lg:p-12 space-y-12 max-w-6xl"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{activeCategory.name}</h2>
                                    <p className="text-slate-500 text-sm font-medium">Sigue las instrucciones y consulta la documentación adjunta.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-12">
                                    {activeCategory.subcategories?.map((sub: any) => (
                                        <section key={sub.id} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] whitespace-nowrap">{sub.name}</h3>
                                                <div className="h-px bg-slate-200 flex-1" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {sub.items?.map((item: any) => (
                                                    <motion.div 
                                                        whileHover={{ y: -4 }}
                                                        key={item.id} 
                                                        className="group bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                    {item.contentType === 'file' && <Download size={20} />}
                                                                    {item.contentType === 'link' && <LinkIcon size={20} />}
                                                                    {item.contentType === 'document' && <FileText size={20} />}
                                                                    {item.contentType === 'info' && <Info size={20} />}
                                                                </div>
                                                                <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                                            </div>
                                                            <h4 className="text-sm font-black text-slate-800 leading-tight pr-4">{item.title}</h4>
                                                        </div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">Acceder {item.contentType}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-8 text-center">
                                <div className="max-w-xs space-y-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                        <LayoutGrid size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Selecciona una categoría</h3>
                                    <p className="text-xs text-slate-400 font-medium">Utiliza el menú de la izquierda para navegar por la información disponible.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
