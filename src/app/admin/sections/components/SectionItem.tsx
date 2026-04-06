import { Trash2, ShieldCheck, Zap, ArrowUpRight, AlertCircle, Lock, Unlock, FileText, Video, Layout, Image as ImageIcon, Check, X } from "lucide-react"
import { SECTION_TEMPLATES } from "@/lib/constants/section-templates"
import { useState } from "react"

interface SectionItemProps {
    section: any
    onDelete: (id: string, name: string) => void
    onUpdate: (id: string, config: any) => void
    isDeleting: boolean
}

export function SectionItem({ section, onDelete, onUpdate, isDeleting }: SectionItemProps) {
    const config = section.config || {}
    const hasError = config.hasError || false
    const isLocked = config.isLocked || false
    const coverUrl = config.coverUrl || ""
    
    const [isEditingImage, setIsEditingImage] = useState(false)
    const [tempUrl, setTempUrl] = useState(coverUrl)

    const toggleError = () => {
        onUpdate(section.id, { ...config, hasError: !hasError })
    }

    const toggleLock = () => {
        onUpdate(section.id, { ...config, isLocked: !isLocked })
    }

    const handleSaveImage = () => {
        onUpdate(section.id, { ...config, coverUrl: tempUrl })
        setIsEditingImage(false)
    }

    return (
        <div className={`group relative bg-white/70 backdrop-blur-md rounded-[32px] border border-white shadow-sm hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex items-stretch gap-0 overflow-hidden ${isLocked ? "opacity-75 grayscale-[0.5]" : ""}`}>
            {/* Status Indicators */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
                {hasError && (
                    <div className="px-2 py-1 bg-rose-500 text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-rose-500/20 animate-pulse">
                        <AlertCircle size={10} strokeWidth={3} />
                        <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Error</span>
                    </div>
                )}
                {isLocked && (
                    <div className="px-2 py-1 bg-slate-900/80 text-white backdrop-blur-md rounded-lg flex items-center gap-1.5 shadow-lg shadow-slate-900/20">
                        <Lock size={10} strokeWidth={3} />
                        <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Bloqueada</span>
                    </div>
                )}
            </div>

            {/* Compact Image - Flush with edges */}
            <div className="w-28 bg-slate-100 relative shrink-0 overflow-hidden">
                {coverUrl ? (
                    <img src={coverUrl} alt={section.name} className="w-full h-full object-cover transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
                        {config.template === 'DOCUMENTOS' && <FileText size={32} strokeWidth={1} />}
                        {config.template === 'VIDEOS' && <Video size={32} strokeWidth={1} />}
                        {config.template === 'POLIZAS' && <ShieldCheck size={32} strokeWidth={1} />}
                        {(config.template === 'GENERICO' || !config.template) && <Layout size={32} strokeWidth={1} />}
                    </div>
                )}
                {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center">
                        <Lock className="text-white opacity-80" size={24} />
                    </div>
                )}
                
                {/* Image Edit Overlay */}
                {!isLocked && (
                    <button 
                        onClick={() => setIsEditingImage(true)}
                        className="absolute inset-0 bg-blue-600/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ImageIcon size={20} />
                    </button>
                )}
            </div>

            {/* Content Info - Compact Padding */}
            <div className="flex-1 min-w-0 p-5 pl-7 flex flex-col justify-center relative">
                {isEditingImage ? (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 p-5 flex flex-col justify-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">URL de la Imagen</p>
                        <div className="flex gap-2">
                            <input 
                                autoFocus
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-400 focus:bg-white transition-all"
                            />
                            <button onClick={handleSaveImage} className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Check size={16} />
                            </button>
                            <button onClick={() => { setIsEditingImage(false); setTempUrl(coverUrl); }} className="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                                    {config.template ? SECTION_TEMPLATES[config.template as keyof typeof SECTION_TEMPLATES]?.label : "Sección"}
                                </p>
                                {config.template && (
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                )}
                                {config.template && (
                                    <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Plantilla</p>
                                )}
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 tracking-tighter truncate uppercase group-hover:text-blue-600 transition-colors">
                                {section.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-semibold font-mono tracking-tight lowercase">/{section.slug}</p>
                        </div>

                        {/* Direct Actions row */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100/30">
                            <button 
                                onClick={toggleError}
                                className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${hasError ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"} px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-100`}
                            >
                                {hasError ? "Quitar Error" : "Avisar Error"}
                            </button>
                            <button 
                                onClick={toggleLock}
                                className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${isLocked ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"} px-3 py-1.5 rounded-lg border border-transparent hover:border-amber-100`}
                            >
                                {isLocked ? "Desbloquear" : "Bloqueo Total"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Sidebar Actions */}
            <div className="flex flex-col gap-2 p-4 justify-center opacity-0 group-hover:opacity-100 transition-all">
                {isLocked ? (
                    <div 
                        className="w-9 h-9 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed shadow-sm"
                        title="Sección Bloqueada"
                    >
                        <Lock size={16} />
                    </div>
                ) : (
                    <a 
                        href={`/admin/sections/${section.slug}`}
                        className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20"
                        title="Configurar"
                    >
                        <ArrowUpRight size={16} />
                    </a>
                )}
                <button 
                    onClick={() => onDelete(section.id, section.name)}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 flex items-center justify-center transition-all shadow-sm"
                    title="Eliminar"
                    disabled={isLocked}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}
