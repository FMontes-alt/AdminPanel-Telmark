"use server"

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getAgents() {
    try {
        const agents = await db.select().from(profiles).orderBy(profiles.createdAt);
        return agents;
    } catch (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
}

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
        // 1. Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password || "Telmark2026!", // Password provisional
            email_confirm: true,
            user_metadata: {
                firstName: data.firstName,
                lastName: data.lastName,
            }
        });

        if (authError) throw authError;

        if (!authData.user) throw new Error("No se pudo crear el usuario en Auth");

        // 2. Crear perfil en la base de datos (Drizzle)
        // Nota: El trigger handle_new_user de Supabase suele crear el perfil automáticamente,
        // pero aquí lo aseguramos o actualizamos con los campos extra.
        const [profile] = await db.insert(profiles).values({
            id: authData.user.id,
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

        revalidatePath("/admin/agents");
        return { success: true, data: profile };
    } catch (error: any) {
        console.error("Error creating agent:", error);
        return { success: false, error: error.message };
    }
}

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
            })
            .where(eq(profiles.id, id))
            .returning();

        revalidatePath("/admin/agents");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Error updating agent:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAgent(id: string) {
    const supabaseAdmin = getAdminClient();
    try {
        // 1. Eliminar de Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) throw authError;

        // 2. Eliminar de la BD (Drizzle)
        await db.delete(profiles).where(eq(profiles.id, id));

        revalidatePath("/admin/agents");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting agent:", error);
        return { success: false, error: error.message };
    }
}
