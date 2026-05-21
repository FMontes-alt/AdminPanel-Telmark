import { User, Mail, Phone, Lock, ShieldCheck } from "lucide-react"

interface AgentBasicFieldsProps {
    formData: any;
    setFormData: (data: any) => void;
    isEditing: boolean;
}

export function AgentBasicFields({ formData, setFormData, isEditing }: AgentBasicFieldsProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            required
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Apellidos</label>
                    <input
                        required
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            required
                            type="email"
                            disabled={isEditing}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {!isEditing && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Contraseña Inicial</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="password"
                            placeholder="Dejar vacío para usar defecto: Telmark2026!"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nivel de Acceso</label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: "usuario", label: "Usuario Base", icon: User },
                        { id: "admin", label: "Administrador", icon: ShieldCheck },
                        { id: "superadmin", label: "Super Admin", icon: Lock },
                    ].map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: r.id })}
                            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                                formData.role === r.id
                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            }`}
                        >
                            <r.icon size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {formData.role === "superadmin" && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldCheck className="text-amber-500 mt-1 flex-shrink-0" size={16} />
                    <div className="space-y-1">
                        <p className="text-xs text-amber-900 font-black uppercase tracking-widest">Rol: Super Administrador</p>
                        <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase">
                            Este rol tiene acceso total a todas las secciones y configuraciones del sistema. Los límites de permisos no se aplican a este nivel.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
