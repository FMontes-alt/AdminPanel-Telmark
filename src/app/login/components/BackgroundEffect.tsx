"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export const BackgroundEffect = () => {
    // Definimos los "imanes" o iconos decorativos
    const magnets = [
        { id: 1, delay: 0, x: "10%", y: "20%" },
        { id: 2, delay: 2, x: "30%", y: "45%" },
        { id: 3, delay: 4, x: "70%", y: "15%" },
        { id: 4, delay: 1, x: "85%", y: "50%" },
        { id: 5, delay: 3, x: "20%", y: "80%" },
        { id: 6, delay: 5, x: "60%", y: "85%" },
    ]

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50/50">
            {/* Líneas Diagonales de Fondo */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                <motion.line
                    x1="0" y1="0" x2="100%" y2="100%"
                    stroke="currentColor" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="text-blue-600"
                />
                <motion.line
                    x1="100%" y1="0" x2="0" y2="100%"
                    stroke="currentColor" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                    className="text-orange-500"
                />
            </svg>

            {/* "Imanes" - Pequeños logos o iconos decorativos que flotan */}
            {magnets.map((magnet) => (
                <motion.div
                    key={magnet.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [0.8, 1, 0.8],
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        delay: magnet.delay,
                        ease: "easeInOut"
                    }}
                    style={{ left: magnet.x, top: magnet.y }}
                    className="absolute w-12 h-12 flex items-center justify-center grayscale opacity-20"
                >
                    <Image
                        src="/cropped-Logo_ColectivoPrime-284x284.png"
                        alt="decor"
                        width={30}
                        height={30}
                        className="object-contain"
                    />
                </motion.div>
            ))}

            {/* Esferas de Luz Originales (Refinadas) */}
            <motion.div
                animate={{
                    x: [0, 50, -30, 0],
                    y: [0, -30, 50, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    x: [0, -50, 30, 0],
                    y: [0, 40, -40, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-[120px]"
            />
        </div>
    )
}
