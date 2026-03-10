"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion, Variants } from "framer-motion"
import { Shield, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "./actions"

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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Efectos de fondo basados en el logo (Blanco + Acentos: Azul, Morado, Naranja, Cereza/Teal) */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-orange-400/20 to-teal-400/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Logo / Cabecera */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 overflow-hidden relative">
                        {/* Pequeño toque de color en el icono temporal hasta que usemos la imagen real */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 opacity-10" />
                        <Shield className="w-8 h-8 text-blue-600 relative z-10" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight">
                        Telmark<span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CMS</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Tu Centro de Gestión Inteligente
                    </p>
                </motion.div>

                {/* Formulario (Card) */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
                >
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {globalError && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                    <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600 shadow-sm rounded-xl">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{globalError}</AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-medium ml-1">Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="admin@telmark.es"
                                                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-12 rounded-xl transition-all shadow-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 ml-1" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-medium ml-1">Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-12 rounded-xl transition-all shadow-sm pr-11"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-50 focus:outline-none"
                                                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                                                    ) : (
                                                        <Eye className="h-5 w-5" strokeWidth={1.5} />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500 ml-1" />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md transition-all font-medium text-[15px] mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verificando credenciales...
                                    </>
                                ) : (
                                    "Acceder al Panel"
                                )}
                            </Button>
                        </form>
                    </Form>
                </motion.div>

                {/* Footer del Login */}
                <motion.div variants={itemVariants} className="mt-10 text-center text-xs text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} Telmark Group. Todos los derechos reservados. <br className="hidden sm:block" />
                    Sistema corporativo de acceso restringido.
                </motion.div>
            </motion.div>
        </div>
    )
}
