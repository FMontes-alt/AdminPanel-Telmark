"use server"

import { db } from "@/db"
import { permissions, userGroups, profiles, quizzes, quizAttempts } from "@/db/schema"
import { eq, or, inArray, sql, and } from "drizzle-orm"

/**
 * Verifica si un usuario tiene permisos de acceso a una sección
 */
export async function checkUserSectionAccess(userId: string, sectionId: string): Promise<boolean> {
    const profile = await db.query.profiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.id, userId)
    })
    if (!profile) return false
    
    // Superadmin y admin tienen acceso a todas las secciones
    if (profile.role === 'superadmin' || profile.role === 'admin') {
        return true
    }

    const userGroupsQuery = await db.select({ groupId: userGroups.groupId })
        .from(userGroups)
        .where(eq(userGroups.userId, userId))

    const userGroupIds = userGroupsQuery.map(g => g.groupId)

    // Obtener los permisos del usuario o de sus grupos
    const perms = await db.select()
        .from(permissions)
        .where(
            or(
                eq(permissions.userId, userId),
                userGroupIds.length > 0 ? inArray(permissions.groupId, userGroupIds) : sql`FALSE`
            )
        )

    return perms.some(p => p.targetType === 'section' && p.targetId === sectionId)
}

/**
 * Verifica si un quiz está desbloqueado para un usuario (si aprobó el prerequisito si existiera)
 */
export async function checkQuizUnlocked(
    userId: string, 
    quizId: string
): Promise<{ unlocked: boolean; requiredQuizTitle?: string }> {
    const quiz = await db.query.quizzes.findFirst({
        where: (quizzes, { eq }) => eq(quizzes.id, quizId)
    })
    
    if (!quiz) {
        return { unlocked: false }
    }
    
    if (!quiz.requiredQuizId) {
        return { unlocked: true }
    }
    
    // Obtener el quiz prerrequisito
    const reqQuiz = await db.query.quizzes.findFirst({
        where: (quizzes, { eq }) => eq(quizzes.id, quiz.requiredQuizId!)
    })
    
    if (!reqQuiz) {
        return { unlocked: true }
    }
    
    // Buscar los intentos completados del prerrequisito por este usuario
    const attempts = await db.select()
        .from(quizAttempts)
        .where(
            and(
                eq(quizAttempts.quizId, quiz.requiredQuizId),
                eq(quizAttempts.userId, userId),
                eq(quizAttempts.status, "completed")
            )
        )
        
    // Verificar si aprobó alguno (porcentaje >= passingScore)
    const passed = attempts.some(att => {
        if (att.score === null || att.maxScore === null || att.maxScore === 0) return false
        const pct = (att.score / att.maxScore) * 100
        return pct >= reqQuiz.passingScore
    })
    
    if (passed) {
        return { unlocked: true }
    }
    
    return { unlocked: false, requiredQuizTitle: reqQuiz.title }
}
