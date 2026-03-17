"use client"

import { motion, Variants } from "framer-motion"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
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

type FormValues = {
    email: string
    password: string
}

interface LoginFormProps {
    form: UseFormReturn<FormValues>
    onSubmit: (values: FormValues) => Promise<void>
    isLoading: boolean
    globalError: string | null
    showPassword: boolean
    setShowPassword: (show: boolean) => void
    variants: Variants
}

export const LoginForm = ({
    form,
    onSubmit,
    isLoading,
    globalError,
    showPassword,
    setShowPassword,
    variants
}: LoginFormProps) => {
    return (
        <motion.div
            variants={variants}
            className="relative"
        >
            {/* Efecto de resplandor exterior suave ( Glow ) */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-600 to-orange-500 rounded-[2.2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/50 p-6 sm:p-8 rounded-[1.8rem] sm:rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                        {globalError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Alert variant="destructive" className="bg-red-50/50 backdrop-blur-sm border-red-100 text-red-600 shadow-sm rounded-xl py-2 px-3">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <AlertDescription className="font-medium text-xs sm:text-sm">{globalError}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold ml-1 text-xs sm:text-sm">Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="admin@telmark.es"
                                            className="bg-white/50 border-slate-200/60 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 sm:h-13 rounded-xl sm:rounded-2xl transition-all shadow-sm focus:bg-white text-sm sm:text-base"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 ml-1 text-[10px] sm:text-xs font-medium" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold ml-1 text-xs sm:text-sm">Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="bg-white/50 border-slate-200/60 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 sm:h-13 rounded-xl sm:rounded-2xl transition-all shadow-sm pr-12 focus:bg-white text-sm sm:text-base"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-slate-100/50 focus:outline-none"
                                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
                                                ) : (
                                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500 ml-1 text-[10px] sm:text-xs font-medium" />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full h-11 sm:h-13 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 hover:scale-[1.01] active:scale-[0.99] text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20 transition-all font-bold text-sm sm:text-[16px] mt-1 group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                    Accediendo...
                                </>
                            ) : (
                                "Acceder al Panel"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}
