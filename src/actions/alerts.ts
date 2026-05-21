"use server"

import { db } from "@/db"
import { alerts } from "@/db/schema"
import { desc, eq, isNull, isNotNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth-guard"

// --- ACCIÓN PARA CREAR LAS ALERTAS
export async function createAlert(data: {
    type: "error" | "lock" | "unlock" | "delete" | "create" | "edit" | "system",
    severity?: "info" | "warning" | "critical",
    message: string,
    targetId?: string,
    targetName?: string,
    targetUrl?: string,
    userId?: string
}) {
    await requireAdmin()
    await db.insert(alerts).values({
        ...data,
        severity: data.severity ?? "info"
    })

    revalidatePath("/admin/alerts")
}

export async function getAlerts() {
    await requireAdmin()
    return db
        .select()
        .from(alerts)
        .orderBy(desc(alerts.createdAt))
        .limit(50)
}

export async function markAlertAsRead(alertId: string) {
    await requireAdmin()
    await db
        .update(alerts)
        .set({ isRead: new Date() })
        .where(eq(alerts.id, alertId))
    
    revalidatePath("/admin/alerts")
    return { success: true }
}

export async function getUnreadAlertsCount() {
    await requireAdmin()
    try {
        const data = await db
            .select()
            .from(alerts)
            .where(isNull(alerts.isRead))
        
        return data.length
    } catch (error) {
        console.error("Error fetching unread count:", error)
        return 0
    }
}

export async function deleteAllAlerts() {
    await requireAdmin()
    try {
        await db.delete(alerts).where(isNotNull(alerts.id))
        revalidatePath("/admin/alerts")
        return { success: true }
    } catch (error: any) {
        console.error("Error al borrar todas las alertas:", error.message)
        return { success: false, error: error.message }
    }
}