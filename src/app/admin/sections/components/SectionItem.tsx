import { Trash2, ShieldCheck, Zap, ArrowUpRight, AlertCircle, Lock, Unlock, FileText, Video, Layout, Image as ImageIcon, Check, X } from "lucide-react"
import { SECTION_TEMPLATES } from "@/lib/constants/section-templates"
import { useState, useEffect } from "react"
import { getSignedUrlAction } from "@/actions/storage"
import { getExternalUrl } from "@/lib/utils"

interface SectionItemProps {
    section: any
    onDelete: (id: string, name: string) => void
    onUpdate: (id: string, config: any) => void
    isDeleting: boolean
}

export function SectionItem({ section, onDelete, onUpdate, isDeleting }: SectionItemProps) {
    if (!section) return null;
    
    const config = section.config || {}
    const hasError = config.hasError || false
    const isLocked = config.isLocked || false
    
    // Prioridad: Columna imagePath -> config.coverUrl (legacy)
    const initialReference = section?.imagePath || config?.coverUrl || ""
    
    // Si es una URL externa, la obtenemos síncronamente
    const externalUrl = getExternalUrl(initialReference);
    
    const [isEditingImage, setIsEditingImage] = useState(false)
    const [tempReference, setTempReference] = useState(initialReference)
    const [storageUrl, setStorageUrl] = useState("")

    useEffect(() => {
        let isMounted = true;
        
        const resolve = async () => {
            // Solo resolvemos si NO es una URL externa y hay una referencia válida
            if (!externalUrl && initialReference && initialReference.length > 3 && !initialReference.includes('://')) {
                try {
                    // Llamamos directamente a la acción de servidor
                    const url = await getSignedUrlAction(initialReference);
                    if (isMounted) setStorageUrl(url || "");
                } catch (err) {
                    console.error("Error resolving image:", err);
                }
            } else {
                if (isMounted) setStorageUrl("");
            }
        };

        resolve();
        return () => { isMounted = false; };
    }, [initialReference, externalUrl]);

    const resolvedUrl = externalUrl || storageUrl;

    const toggleError = () => {
        onUpdate(section.id, { config: { ...config, hasError: !hasError } })
    }

    const toggleLock = () => {
        onUpdate(section.id, { config: { ...config, isLocked: !isLocked } })
    }

    const handleSaveImage = () => {
        onUpdate(section.id, { imagePath: tempReference })
        setIsEditingImage(false)
    }

    // Seguridad total para el renderizado
    if (!section?.id) return null;

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
                {resolvedUrl ? (
                    <img 
                        key={resolvedUrl} 
                        src={resolvedUrl} 
                        alt={section?.name || 'Sección'} 
                        className="w-full h-full object-cover transition-transform duration-700"
                        onError={(e) => {
                            // Si la URL falla, ocultamos la imagen y mostramos el fallback
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                {/* Fallback icon - visible si no hay URL o si carga falla */}
                <div className={`w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300 absolute inset-0 ${resolvedUrl ? 'hidden' : ''}`}>
                    {config?.template === 'DOCUMENTOS' && <FileText size={32} strokeWidth={1} />}
                    {config?.template === 'VIDEOS' && <Video size={32} strokeWidth={1} />}
                    {config?.template === 'POLIZAS' && <ShieldCheck size={32} strokeWidth={1} />}
                    {(!config?.template || config?.template === 'GENERICO') && <Layout size={32} strokeWidth={1} />}
                </div>
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

            {/* Content Info */}
            <div className="flex-1 min-w-0 p-5 pl-7 flex flex-col justify-center relative bg-white">
                {isEditingImage ? (
                    <div className="absolute inset-0 bg-white z-30 p-5 flex flex-col justify-center gap-3">
                        <p className="text-[9px] font-black text-blue-600 uppercase">URL o Path de Storage</p>
                        <div className="flex gap-2">
                            <input 
                                autoFocus
                                value={tempReference}
                                onChange={(e) => setTempReference(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none"
                            />
                            <button onClick={handleSaveImage} className="px-3 bg-blue-600 text-white rounded-xl text-xs font-bold">OK</button>
                            <button onClick={() => setIsEditingImage(false)} className="px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold">X</button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="space-y-0.5 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
                                    {config?.template || "SECCIÓN"}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 uppercase">
                                {section?.name || "Sin nombre"}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono">/{section?.slug || "sin-slug"}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={toggleError}
                                className={`text-[10px] font-bold uppercase p-2 rounded-lg border ${hasError ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                            >
                                {hasError ? "Error Activo" : "Avisar Error"}
                            </button>
                            <button 
                                onClick={toggleLock}
                                className={`text-[10px] font-bold uppercase p-2 rounded-lg border ${isLocked ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                            >
                                {isLocked ? "Bloqueada" : "Bloquear"}
                            </button>
                        </div>
                    </div>
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
