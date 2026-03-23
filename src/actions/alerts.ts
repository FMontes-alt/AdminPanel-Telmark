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