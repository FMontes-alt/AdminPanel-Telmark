"use server"

import { db } from "@/db"
import { alerts } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// --- ACCIÓN PARA CREAR LAS ALERTAS
export async function createAlert(data: {
    type: "error" | "lock" | "unlock" | "delete" | "create" | "edit" | "system",
    severity?: "info" | "warning" | "critical",
    message: string,
    targetId?: string,
    targetName?: string,
    userId?: string
}) {
    await db.insert(alerts).values({
        ...data,
        severity: data.severity ?? "info"
    })

    revalidatePath("/admin/alerts")
}

export async function getAlerts() {
    return db
        .select()
        .from(alerts)
        .orderBy(desc(alerts.createdAt))
        .limit(50)
}

export async function markAlertAsRead(alertId: string) {
    await db
        .update(alerts)
        .set({ isRead: new Date() })
        .where(eq(alerts.id, alertId))
    
    revalidatePath("/admin/alerts")
    return { success: true }
}