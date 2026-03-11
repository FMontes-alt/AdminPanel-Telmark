"use client"

export const BackgroundEffect = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Sección Izquierda */}
            <div
                className="absolute inset-y-0 left-0 w-full bg-slate-100"
                style={{ clipPath: 'polygon(0 0, 35% 0, 20% 100%, 0 100%)' }}
            />

            {/* Sección Central */}
            <div
                className="absolute inset-y-0 left-0 w-full bg-slate-50"
                style={{ clipPath: 'polygon(35% 0, 75% 0, 60% 100%, 20% 100%)' }}
            />

            {/* Sección Derecha */}
            <div
                className="absolute inset-y-0 left-0 w-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.02)]"
                style={{ clipPath: 'polygon(75% 0, 100% 0, 100% 100%, 60% 100%)' }}
            />

            {/* Sutiles gradientes para dar profundidad */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-orange-50/20 opacity-50" />
        </div>
    )
}

