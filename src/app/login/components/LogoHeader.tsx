"use client"

import { motion, Variants } from "framer-motion"
import Image from "next/image"

interface LogoHeaderProps {
    variants: Variants
}

export const LogoHeader = ({ variants }: LogoHeaderProps) => {
    return (
        <motion.div variants={variants} className="text-center mb-6 sm:mb-10">
            {/* Contenedor del Logo con Animación de Flotado - Tamaño ajustado para responsividad */}
            <motion.div
                animate={{
                    y: [0, -8, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="inline-flex items-center justify-center w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-white shadow-[0_15px_40px_rgba(0,0,0,0.06)] mb-6 sm:mb-8 overflow-hidden relative group"
            >
                {/* Resplandor interno animado */}
                <motion.div
                    animate={{
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-orange-400"
                />

                <Image
                    src="/cropped-Logo_ColectivoPrime-284x284.png"
                    alt="Telmark Logo"
                    width={100}
                    height={100}
                    className="relative z-10 object-contain p-3 sm:p-4 group-hover:scale-110 transition-transform duration-500"
                />
            </motion.div>

            {/* Texto con Gradiente Basado en el Logo */}
            <h1 className="text-2xl sm:text-3xl font-light text-slate-800 tracking-tight">
                Telmark<span className="font-bold bg-gradient-to-tr from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">CMS</span>
            </h1>
            <p className="text-slate-500 mt-2 sm:mt-3 text-[11px] sm:text-sm font-semibold tracking-widest uppercase">
                TU CENTRO DE GESTIÓN INTELIGENTE
            </p>
        </motion.div>
    )
}
