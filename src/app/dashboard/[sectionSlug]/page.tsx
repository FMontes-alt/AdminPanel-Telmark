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
    Target,
    Video,
    X
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getSectionBySlug } from "@/actions/sections"
import { getCategories } from "@/actions/categories"
import { getSubcategories } from "@/actions/subcategories"
import { getItems } from "@/actions/items"
import { getSignedUrlAction } from "@/actions/storage"

// ─── Componente Visor de Subcategoría ──────────────────────────────
function SubcategoryViewer({ sub }: { sub: any }) {
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loadingPreview, setLoadingPreview] = useState(false)

    const getContentIcon = (contentType: string) => {
        switch (contentType) {
            case 'file': return <Download size={20} />
            case 'link': return <LinkIcon size={20} />
            case 'document': return <FileText size={20} />
            case 'video': return <Video size={20} />
            case 'info': return <Info size={20} />
            default: return <FileText size={20} />
        }
    }

    const getSmallIcon = (contentType: string) => {
        switch (contentType) {
            case 'file': return <Download size={16} />
            case 'link': return <LinkIcon size={16} />
            case 'document': return <FileText size={16} />
            case 'video': return <Video size={16} />
            case 'info': return <Info size={16} />
            default: return <FileText size={16} />
        }
    }

    const getEmbedUrl = (url: string) => {
        if (!url) return url;
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }
        const vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/i);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
        return url;
    }

    const handleSelectItem = async (item: any) => {
        if (selectedItem?.id === item.id) {
            handleClose()
            return
        }

        setSelectedItem(item)
        setPreviewUrl(null)
        setLoadingPreview(true)

        try {
            if (item.filePath) {
                const url = await getSignedUrlAction(item.filePath)
                if (url && (item.filePath.toLowerCase().endsWith('.pdf') || item.contentType === 'document')) {
                    try {
                        const response = await fetch(url)
                        const blob = await response.blob()
                        const objectUrl = URL.createObjectURL(blob)
                        setPreviewUrl(objectUrl)
                    } catch (e) {
                        setPreviewUrl(url)
                    }
                } else {
                    setPreviewUrl(url)
                }
            } else if (item.externalLink) {
                let url = item.externalLink
                if (url.trim().startsWith('<iframe')) {
                    const match = url.match(/src=["']([^"']+)["']/)
                    if (match && match[1]) url = match[1]
                }
                setPreviewUrl(getEmbedUrl(url))
            }
        } catch (error) {
            console.error("Error loading preview:", error)
        } finally {
            setLoadingPreview(false)
        }
    }

    const handleClose = () => {
        setSelectedItem(null)
        setPreviewUrl(null)
    }

    const handleDownload = () => {
        if (previewUrl) {
            const a = document.createElement('a')
            a.href = previewUrl
            a.download = selectedItem?.title || 'download'
            a.target = '_blank'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
    }

    const isImage = (path: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(path)
    const isVideo = (path: string) => /\.(mp4|mov|webm|avi|mkv)$/i.test(path)
    const isPdf = (path: string) => /\.pdf$/i.test(path)

    const renderPreview = () => {
        if (loadingPreview) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando...</p>
                    </div>
                </div>
            )
        }

        if (!previewUrl || !selectedItem) return null

        const item = selectedItem

        // Video como archivo
        if (item.filePath && (isVideo(item.filePath) || item.contentType === 'video')) {
            return <video src={previewUrl} controls className="w-full h-full object-contain rounded-xl" />
        }

        // Imagen
        if (item.filePath && isImage(item.filePath)) {
            return <img src={previewUrl} alt={item.title} className="w-full h-full object-contain rounded-xl" />
        }

        // PDF
        if (item.filePath && isPdf(item.filePath)) {
            return <iframe src={previewUrl} className="w-full h-full rounded-xl border-0" title={item.title} />
        }

        // Video embed (YouTube/Vimeo) o Link
        if (item.contentType === 'video' || item.contentType === 'link') {
            return <iframe src={previewUrl} className="w-full h-full rounded-xl border-0" title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        }

        // Info (texto)
        if (item.contentType === 'info') {
            return (
                <div className="p-6 overflow-y-auto h-full">
                    <h3 className="text-lg font-black text-slate-900 mb-4">{item.title}</h3>
                    <div className="prose prose-sm text-slate-600">{item.body || "Sin contenido adicional."}</div>
                </div>
            )
        }

        // Fallback genérico: iframe
        if (item.filePath) {
            return <iframe src={previewUrl} className="w-full h-full rounded-xl border-0" title={item.title} />
        }

        return (
            <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-3">
                    <Download size={32} className="mx-auto text-slate-300" />
                    <p className="text-sm text-slate-500 font-bold">Vista previa no disponible</p>
                    <button onClick={handleDownload} className="text-xs text-blue-600 font-bold uppercase underline">Descargar archivo</button>
                </div>
            </div>
        )
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-4">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] whitespace-nowrap">{sub.name}</h3>
                <div className="h-px bg-slate-200 flex-1" />
            </div>

            <AnimatePresence mode="wait">
                {selectedItem ? (
                    /* ── Layout Master-Detail ── */
                    <motion.div
                        key="viewer"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4"
                    >
                        {/* Panel Izquierdo: Visor */}
                        <div className="flex-[2] min-w-0 bg-white border border-slate-200 rounded-[24px] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[500px]">
                            {/* Barra superior del visor */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                                        {getSmallIcon(selectedItem.contentType)}
                                    </div>
                                    <div className="max-w-[150px] sm:max-w-xs md:max-w-sm truncate">
                                        <h4 className="text-sm font-black text-slate-800 leading-tight truncate">{selectedItem.title}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedItem.contentType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {previewUrl && (
                                        <button 
                                            onClick={handleDownload}
                                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                            title="Descargar"
                                        >
                                            <Download size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        title="Cerrar"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                            {/* Área de contenido */}
                            <div className="flex-1 p-2 bg-slate-50">
                                {renderPreview()}
                            </div>
                        </div>

                        {/* Panel Derecho: Lista de ítems */}
                        <div className="flex-[1] min-w-0 flex flex-col gap-2">
                            {sub.items?.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ x: -2 }}
                                    onClick={() => handleSelectItem(item)}
                                    className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                        selectedItem?.id === item.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg transition-colors ${
                                            selectedItem?.id === item.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                                        }`}>
                                            {getSmallIcon(item.contentType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-xs font-black leading-tight truncate ${
                                                selectedItem?.id === item.id ? 'text-white' : 'text-slate-800'
                                            }`}>{item.title}</h4>
                                            <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${
                                                selectedItem?.id === item.id ? 'text-blue-200' : 'text-slate-400'
                                            }`}>{item.contentType}</p>
                                        </div>
                                        <ChevronRight size={14} className={`flex-shrink-0 ${
                                            selectedItem?.id === item.id ? 'text-white/60' : 'text-slate-200'
                                        }`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* ── Layout Grid Normal ── */
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {sub.items?.map((item: any) => (
                            <motion.div 
                                whileHover={{ y: -4 }}
                                key={item.id} 
                                onClick={() => handleSelectItem(item)}
                                className="group bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            {getContentIcon(item.contentType)}
                                        </div>
                                        <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 leading-tight pr-4">{item.title}</h4>
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">Acceder {item.contentType}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

// ─── Página Principal ──────────────────────────────────────────────
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
            const currentSection = await getSectionBySlug(sectionSlug as string)
            if (currentSection) {
                setSection(currentSection)
                const cats = await getCategories(currentSection.id)

                const catsWithSubs = await Promise.all(cats.map(async (cat: any) => {
                    const subs = await getSubcategories(cat.id)
                    const subsWithItems = await Promise.all(subs.map(async (sub: any) => {
                        const its = await getItems(sub.id)
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
                                        <SubcategoryViewer key={sub.id} sub={sub} />
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
