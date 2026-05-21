"use client"

import { useRef } from "react"
import { Upload, Video, Image as ImageIcon } from "lucide-react"

interface MediaEditorProps {
    selectedFile: File | null
    setSelectedFile: (file: File | null) => void
    mediaType: string
    setMediaType: (type: string) => void
    existingMediaUrl: string | null
    setExistingMediaUrl: (url: string | null) => void
    setMediaUrl: (url: string) => void
    uploadProgress: number | null
}

export default function MediaEditor({
    selectedFile,
    setSelectedFile,
    mediaType,
    setMediaType,
    existingMediaUrl,
    setExistingMediaUrl,
    setMediaUrl,
    uploadProgress
}: MediaEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Imagen o Video (opcional)
                </label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${selectedFile ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 shadow-sm'}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept="image/*,video/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                if (file.size > 50 * 1024 * 1024) return alert("Máximo 50MB")
                                setSelectedFile(file)
                                if (file.type.startsWith('image/')) setMediaType('image')
                                else if (file.type.startsWith('video/')) setMediaType('video')
                            }
                        }}
                    />
                    {selectedFile ? (
                        <>
                            <div className="p-3 bg-white rounded-full text-green-600 shadow-sm">
                                <Upload size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-green-700">{selectedFile.name}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedFile(null)
                                    if (!existingMediaUrl) {
                                        setMediaType("none")
                                        setMediaUrl("")
                                    }
                                }}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700"
                            >
                                Quitar archivo
                            </button>
                        </>
                    ) : existingMediaUrl ? (
                        <>
                            <div className="w-full max-h-32 rounded-xl overflow-hidden mb-2 relative group/preview">
                                {mediaType === 'image' ? (
                                    <img src={existingMediaUrl} alt="Preview" className="w-full h-full object-contain bg-slate-100" />
                                ) : (
                                    <div className="w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Video size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Cambiar archivo</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setExistingMediaUrl(null)
                                    setMediaUrl("")
                                    setMediaType("none")
                                }}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700"
                            >
                                Eliminar multimedia
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-white rounded-full text-slate-400 shadow-sm">
                                <Upload size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-600">Haz clic para subir un archivo</p>
                                <p className="text-[10px] text-slate-400">Imágenes o Video (Max. 50MB)</p>
                            </div>
                        </>
                    )}
                    {uploadProgress !== null && (
                        <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tipo de Media</label>
                <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full bg-slate-50 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                >
                    <option value="none">Ninguno</option>
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                </select>
            </div>
        </div>
    )
}
