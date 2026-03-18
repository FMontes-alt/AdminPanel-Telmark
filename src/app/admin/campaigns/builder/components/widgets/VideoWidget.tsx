"use client"

import { VideoWidgetData } from "@/lib/types/campaing-builder";
import { Youtube, MonitorPlay } from "lucide-react";

interface VideoWidgetProps {
    data: VideoWidgetData['data'];
    onChange: (newData: VideoWidgetData['data']) => void;
}

export function VideoWidget({ data, onChange }: VideoWidgetProps) {
    return (
        <div className="p-4 h-full flex flex-col gap-3 justify-center">
            {!data.url ? (
                <div className="flex flex-col items-center gap-2">
                    <MonitorPlay className="text-slate-200" size={32} />
                    <input
                        type="text"
                        placeholder="URL de Video (Youtube/Vimeo)"
                        className="w-full text-[10px] border border-slate-100 p-2 rounded-none focus:border-blue-300 outline-none"
                        onChange={(e) => onChange({ ...data, url: e.target.value })}
                    />
                </div>
            ) : (
                <div className="relative group/video h-full flex flex-col">
                    <div className="flex-1 bg-slate-900 flex items-center justify-center rounded-none overflow-hidden">
                        <Youtube className="text-white opacity-20" size={48} />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{data.url}</span>
                         <button 
                            onClick={() => onChange({ ...data, url: '' })}
                            className="text-[10px] text-blue-500 font-bold hover:underline"
                         >
                            Cambiar
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
}
