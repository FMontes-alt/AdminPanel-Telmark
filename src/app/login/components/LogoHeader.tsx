"use client"

import { motion, Variants } from "framer-motion"
import Image from "next/image"

interface LogoHeaderProps {
    variants: Variants
}

export const LogoHeader = ({ variants }: LogoHeaderProps) => {
    return (
        <motion.div variants={variants} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-[120px] h-[120px] rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 opacity-5" />
                <Image
                    src="/logo.png"
                    alt="Telmark Logo"
                    width={100}
                    height={100}
                    className="relative z-10 object-contain p-2"
                />
            </div>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
                Telmark<span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CMS</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
                Tu Centro de Gestión Inteligente
            </p>
        </motion.div>
    )
}
