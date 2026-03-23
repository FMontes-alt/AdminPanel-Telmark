"use client"

import React from "react"
import { Sparkles, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BuilderHeaderProps {
    widgetsCount: number;
    isSaving: boolean;
    isPublishing: boolean;
    onSave: () => void;
    onPublish: () => void;
}

export function BuilderHeader({ widgetsCount, isSaving, isPublishing, onSave, onPublish }: BuilderHeaderProps) {
    return (
        <header className="relative bg-white border-b border-slate-200 p-4 shadow-sm z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1600px] mx-auto">
                {/* Logo y Título */}
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900 rounded-lg shadow-lg shadow-slate-200">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                            Constructor <span className="text-blue-700">Telmark</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Campaña en edición • {widgetsCount} BLOQUES
                        </p>
                    </div>
                </div>
                {/* Acciones */}
                <div className="flex items-center gap-3">
                    {/* Botón Guardar (Borrador) */}
                    <Button
                        onClick={onSave}
                        variant="outline"
                        size="sm"
                        disabled={isSaving || isPublishing}
                        className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full px-6 py-4 transition-all font-bold text-xs uppercase tracking-widest gap-2"
                    >
                        {isSaving ? (
                            <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        {isSaving ? "Guardando..." : "Guardar Borrador"}
                    </Button>
                    {/* Botón Publicar (Producción) */}
                    <Button
                        onClick={onPublish}
                        size="sm"
                        disabled={isSaving || isPublishing}
                        className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-8 py-4 transition-all font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {isPublishing ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                        {isPublishing ? "Publicando..." : "Publicar Ahora"}
                    </Button>
                </div>
            </div>
        </header>
    );
}
