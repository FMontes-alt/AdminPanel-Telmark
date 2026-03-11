"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion, Variants } from "framer-motion"

import { login } from "./actions"
import { BackgroundEffect } from "./components/BackgroundEffect"
import { LogoHeader } from "./components/LogoHeader"
import { LoginForm } from "./components/LoginForm"
import { LoginFooter } from "./components/LoginFooter"

const formSchema = z.object({
    email: z.string().email({
        message: "Por favor, introduce un email válido.",
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
})

// Variantes de animación para Framer Motion
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
}

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [globalError, setGlobalError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setGlobalError(null)

        const formData = new FormData()
        formData.append("email", values.email)
        formData.append("password", values.password)

        const result = await login(formData)

        if (result?.error) {
            setGlobalError(result.error)
            setIsLoading(false)
        } else if (result?.success) {
            // Si el login es correcto, redirigimos al dashboard admin
            router.push("/admin")
            router.refresh() // Forzamos recarga para que el middleware pille bien la sesión
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center sm:justify-center p-4 relative overflow-x-hidden overflow-y-auto">
            <BackgroundEffect />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[420px] relative z-10 py-8"
            >
                <LogoHeader variants={itemVariants} />

                <LoginForm
                    form={form}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                    globalError={globalError}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    variants={itemVariants}
                />

                <LoginFooter variants={itemVariants} />
            </motion.div>
        </div>
    )
}
