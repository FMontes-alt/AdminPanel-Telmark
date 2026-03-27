"use server"

import { db } from "@/db";
import { profiles, sections } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * 1.OBTENER EMPLEADOS 
 */
export async function getAgents() {
    try {
        const agents = await db.select().from(profiles).orderBy(profiles.createdAt);
        return agents;
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        return [];
    }
}

/**
 * 1.5 OBTENER DATOS DEL DASHBOARD PARA EL USUARIO ACTUAL
 */
export async function getDashboardData() {
    const { createServerClient } = await import("@supabase/ssr")
    const { cookies } = await import("next/headers")
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() {}
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
    })

    if (!profile) return { profile: null, sections: [] }

    let assignedSections: any[] = []
    if (profile.assignedSectionIds && profile.assignedSectionIds.length > 0) {
        assignedSections = await db.select().from(sections).where(inArray(sections.id, profile.assignedSectionIds))
    }

    return { profile, sections: assignedSections }
}

/**
 * 2. CREAR EMPLEADOS
 */
export async function createAgent(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: "admin" | "usuario" | "superadmin";
    assignedSectionIds?: string[];
    password?: string;
}) {
    const supabaseAdmin = getAdminClient();
    try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password || "Telmark2026!", // Contraseña por defecto 
            email_confirm: true,
            user_metadata: {
                firstName: data.firstName,
                lastName: data.lastName,
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario en Auth");

        const [profile] = await db.insert(profiles).values({
            id: authData.user.id, // Enlazamos con el ID de Supabase
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role,
            assignedSectionIds: data.assignedSectionIds || [],
        }).onConflictDoUpdate({
            target: [profiles.id],
            set: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role,
                assignedSectionIds: data.assignedSectionIds || [],
                updatedAt: new Date(),
            }
        }).returning();

        //Refrecamos la ruta para que vea al momento 
        revalidatePath("/admin/agents");
        return { success: true, data: profile };
    } catch (error: any) {
        console.error("Error al crear empleado:", error);
        return { success: false, error: error.message }
    }
}

/**
 * 3. ACTUALIZAR EMPLEADO
 */
export async function updateAgent(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    role: "admin" | "usuario" | "superadmin";
    assignedSectionIds: string[];
}>) {
    try {
        const [updated] = await db.update(profiles)
            .set({
                ...data,
                updatedAt: new Date(),
            }).where(eq(profiles.id, id)).returning();

        revalidatePath("/admin/agents");
        return { success: true, data: updated }
    } catch (error: any) {
        console.error("error al actualizar", error);
        return { success: false, error: error.message };
    }
}

/**
 * 4. ELIMINAR EMPLEADO
 */
export async function deleteAgent(id: string) {
    const supabaseAdmin = getAdminClient();
    try {
        await supabaseAdmin.auth.admin.deleteUser(id);
        await db.delete(profiles).where(eq(profiles.id, id));

        revalidatePath("/admin/agents");
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar", error);
        return { success: false, error: error.message };
    }
}