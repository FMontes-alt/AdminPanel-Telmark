"use client"

import React from "react"
import { Sparkles, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BuilderHeaderProps {
    widgetsCount: number;
    isSaving: boolean;
    onSave: () => void;
}

export function BuilderHeader({ widgetsCount, isSaving, onSave }: BuilderHeaderProps) {
    return (
        <header className="relative bg-white border-b border-slate-200 p-4 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                        Constructor <span className="text-blue-700">Telmark</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {widgetsCount} BLOQUES
                    </span>
                    <Button
                        onClick={onSave}
                        size="sm"
                        disabled={isSaving}
                        className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-8 py-4 transition-all font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-blue-500/10"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </div>
        </header>
    );
}
