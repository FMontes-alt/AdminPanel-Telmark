"use client"

import { motion } from "framer-motion"

export const BackgroundEffect = () => {
    return (
        <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-orange-400/20 to-teal-400/20 rounded-full blur-[100px] pointer-events-none" />
        </>
    )
}
