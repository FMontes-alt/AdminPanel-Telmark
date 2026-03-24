import { User, Mail, Shield, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AdminPageHeader } from "@/components/ui/admin-page-header"

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-12 min-h-screen">
            <AdminPageHeader
                category="Cuenta"
                title={<>Mi <span className="text-blue-600">Perfil</span></>}
                description="Gestiona tu información personal y preferencias."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <User size={64} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{user?.email?.split('@')[0] || 'Usuario'}</h2>
                            <p className="text-blue-600 text-xs font-black uppercase tracking-widest mt-1">Administrador</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Seguridad</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">Tu cuenta está protegida con autenticación de doble factor y cifrado de extremo a extremo.</p>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-all">
                            Cambiar Contraseña
                        </button>
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Shield className="text-blue-600" size={20} />
                            Información de la Cuenta
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Mail size={12} /> Email
                                </label>
                                <p className="text-slate-700 font-bold">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Shield size={12} /> Rol
                                </label>
                                <p className="text-slate-700 font-bold capitalize">Super Admin</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} /> Miembro desde
                                </label>
                                <p className="text-slate-700 font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Desconocido'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin size={12} /> Ubicación
                                </label>
                                <p className="text-slate-700 font-bold">Oficina Central</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end">
                            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
