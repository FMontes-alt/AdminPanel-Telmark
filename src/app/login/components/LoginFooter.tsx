"use client"

import { motion, Variants } from "framer-motion"

interface LoginFooterProps {
    variants: Variants
}

export const LoginFooter = ({ variants }: LoginFooterProps) => {
    return (
        <motion.div variants={variants} className="mt-10 text-center text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Telmark Group. Todos los derechos reservados. <br className="hidden sm:block" />
            Sistema corporativo de acceso restringido.
        </motion.div>
    )
}
