"use client"

import { motion, Variants } from "framer-motion"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useForm, UseFormReturn } from "react-hook-form"
import * as z from "zod"
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

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

type FormValues = z.infer<typeof formSchema>

interface LoginFormProps {
    form: any // UseFormReturn<FormValues>
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
    )
}
