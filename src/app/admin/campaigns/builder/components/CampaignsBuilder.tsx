"use client"

import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function CampaignsBuilder() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 rounded-xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Constructor de Campaña</h1>
                <p className="text-slate-500">Arrastra y organiza los componentes del dashboard</p>
            </div>
            <ResponsiveGridLayout
                className="layout"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100} //! He subido la altura para que se vean mejor los bloques
            >
                {/* BLOQUE DE PRUEBA 1 */}
                <div
                    key="video-test"
                    data-grid={{ x: 0, y: 0, w: 4, h: 2 }}
                    className="bg-white border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-move shadow-sm hover:border-blue-400 transition-colors"
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-blue-600">📹</span>
                    </div>
                    <span className="text-slate-600 font-medium">Widget de Vídeo</span>
                </div>
                {/* BLOQUE DE PRUEBA 2 */}
                <div
                    key="text-test"
                    data-grid={{ x: 4, y: 0, w: 6, h: 2 }}
                    className="bg-white border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-move shadow-sm hover:border-emerald-400 transition-colors"
                >
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-emerald-600">📝</span>
                    </div>
                    <span className="text-slate-600 font-medium">Bloque de Texto</span>
                </div>
            </ResponsiveGridLayout>
        </div>
    );

}