"use server"

import { db } from "@/db"
import { alerts } from "@/db/schema"
import { desc, eq, isNull, isNotNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth-guard"
import { ActionResult } from "@/lib/types/actions"
import { formatError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

// --- ACCIÓN PARA CREAR LAS ALERTAS
export async function createAlert(data: {
    type: "error" | "lock" | "unlock" | "delete" | "create" | "edit" | "system",
    severity?: "info" | "warning" | "critical",
    message: string,
    targetId?: string,
    targetName?: string,
    targetUrl?: string,
    userId?: string
}): Promise<ActionResult> {
    try {
        await requireAdmin()
        await db.insert(alerts).values({
            ...data,
            severity: data.severity ?? "info"
        })

        revalidatePath("/admin/alerts")
        return { success: true, data: undefined }
    } catch (error) {
        log.error("Error creating alert:", error)
        return { success: false, error: formatError(error).message }
    }
}

export async function getAlerts() {
    await requireAdmin()
    return db
        .select()
        .from(alerts)
        .orderBy(desc(alerts.createdAt))
        .limit(50)
}

export async function markAlertAsRead(alertId: string): Promise<ActionResult> {
    try {
        await requireAdmin()
        await db
            .update(alerts)
            .set({ isRead: new Date() })
            .where(eq(alerts.id, alertId))
        
        revalidatePath("/admin/alerts")
        return { success: true, data: undefined }
    } catch (error) {
        log.error("Error marking alert as read:", error)
        return { success: false, error: formatError(error).message }
    }
}

export async function getUnreadAlertsCount() {
    try {
        await requireAdmin()
        const data = await db
            .select()
            .from(alerts)
            .where(isNull(alerts.isRead))
        
        return data.length
    } catch (error) {
        log.error("Error fetching unread count:", error)
        return 0
    }
}

export async function deleteAllAlerts(): Promise<ActionResult> {
    try {
        await requireAdmin()
        await db.delete(alerts).where(isNotNull(alerts.id))
        revalidatePath("/admin/alerts")
        return { success: true, data: undefined }
    } catch (error) {
        log.error("Error deleting all alerts:", error)
        return { success: false, error: formatError(error).message }
    }
}