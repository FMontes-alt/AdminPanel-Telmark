"use server"

import { db } from "@/db"
import { quizAttempts, quizAnswers, quizQuestions, quizOptions, profiles } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { formatError } from "@/lib/error-handler"
import type { SubmitAnswerInput } from "@/lib/types/quiz"

// ─── ATTEMPTS ───────────────────────────────────────────────────────────

export async function startAttempt(quizId: string, userId: string) {
    try {
        const [attempt] = await db
            .insert(quizAttempts)
            .values({
                quizId,
                userId,
            })
            .returning()

        return { success: true, data: attempt }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

export async function completeAttempt(attemptId: string) {
    try {
        // 1. Obtener todas las respuestas del intento
        const answers = await db
            .select()
            .from(quizAnswers)
            .where(eq(quizAnswers.attemptId, attemptId))

        // 2. Obtener el intento para saber el quiz
        const [attempt] = await db
            .select()
            .from(quizAttempts)
            .where(eq(quizAttempts.id, attemptId))
            .limit(1)

        if (!attempt) return { error: "Intento no encontrado" }

        // 3. Obtener todas las preguntas del quiz para calcular maxScore
        const questions = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, attempt.quizId))

        // 4. Calcular puntuación
        let score = 0
        const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
        
        // Determinar si hay preguntas para revisión manual
        const hasShortAnswer = questions.some(q => q.type === "short_answer")
        const finalStatus = hasShortAnswer ? "pending_review" : "completed"

        for (const answer of answers) {
            if (answer.isCorrect) {
                const question = questions.find(q => q.id === answer.questionId)
                if (question) score += question.points
            }
        }

        // 5. Actualizar el intento
        const [completed] = await db
            .update(quizAttempts)
            .set({
                score,
                maxScore,
                status: finalStatus as any,
                completedAt: new Date(),
            })
            .where(eq(quizAttempts.id, attemptId))
            .returning()

        return { success: true, data: completed }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

// ─── ANSWERS ────────────────────────────────────────────────────────────

export async function submitAnswer(data: SubmitAnswerInput) {
    try {
        // 1. Obtener la pregunta y sus opciones correctas
        const [question] = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.id, data.questionId))
            .limit(1)

        if (!question) return { error: "Pregunta no encontrada" }

        let isCorrect: boolean | null = null

        if (question.type === "short_answer") {
            // Para respuesta corta, el admin revisará manualmente → null
            isCorrect = null
        } else {
            // Para choice/true_false: comparar con opciones correctas
            const correctOptions = await db
                .select()
                .from(quizOptions)
                .where(and(
                    eq(quizOptions.questionId, data.questionId),
                    eq(quizOptions.isCorrect, true)
                ))

            const correctIds = correctOptions.map(o => o.id).sort()
            const selectedIds = (data.selectedOptions || []).sort()

            // Correcto si las selecciones coinciden exactamente con las correctas
            isCorrect =
                correctIds.length === selectedIds.length &&
                correctIds.every((id, i) => id === selectedIds[i])
        }

        // 2. Verificar si ya existe una respuesta para esta pregunta en este intento
        const existing = await db
            .select()
            .from(quizAnswers)
            .where(and(
                eq(quizAnswers.attemptId, data.attemptId),
                eq(quizAnswers.questionId, data.questionId)
            ))
            .limit(1)

        if (existing.length > 0) {
            // Actualizar respuesta existente
            const [updated] = await db
                .update(quizAnswers)
                .set({
                    selectedOptions: data.selectedOptions || [],
                    textAnswer: data.textAnswer || null,
                    isCorrect,
                })
                .where(eq(quizAnswers.id, existing[0].id))
                .returning()
            return { success: true, data: updated }
        }

        // 3. Crear nueva respuesta
        const [answer] = await db
            .insert(quizAnswers)
            .values({
                attemptId: data.attemptId,
                questionId: data.questionId,
                selectedOptions: data.selectedOptions || [],
                textAnswer: data.textAnswer || null,
                isCorrect,
            })
            .returning()

        return { success: true, data: answer }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

// ─── RESULTS ────────────────────────────────────────────────────────────

export async function getAttemptResults(attemptId: string) {
    try {
        const [attempt] = await db
            .select()
            .from(quizAttempts)
            .where(eq(quizAttempts.id, attemptId))
            .limit(1)

        if (!attempt) return null

        const answers = await db
            .select()
            .from(quizAnswers)
            .where(eq(quizAnswers.attemptId, attemptId))

        // Obtener preguntas con opciones para mostrar el detalle
        const questions = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, attempt.quizId))
            .orderBy(quizQuestions.sortOrder)

        const questionsWithDetails = await Promise.all(
            questions.map(async (q) => {
                const options = await db
                    .select()
                    .from(quizOptions)
                    .where(eq(quizOptions.questionId, q.id))
                    .orderBy(quizOptions.sortOrder)
                const answer = answers.find(a => a.questionId === q.id)
                return { ...q, options, userAnswer: answer || null }
            })
        )

        return {
            attempt,
            questions: questionsWithDetails,
        }
    } catch (error) {
        console.error("Error fetching attempt results:", error)
        return null
    }
}

export async function getUserAttempts(quizId: string, userId: string) {
    try {
        return db
            .select()
            .from(quizAttempts)
            .where(and(
                eq(quizAttempts.quizId, quizId),
                eq(quizAttempts.userId, userId)
            ))
            .orderBy(desc(quizAttempts.startedAt))
    } catch (error) {
        console.error("Error fetching user attempts:", error)
        return []
    }
}

export async function getQuizAttempts(quizId: string) {
    try {
        const attempts = await db
            .select({
                id: quizAttempts.id,
                quizId: quizAttempts.quizId,
                userId: quizAttempts.userId,
                score: quizAttempts.score,
                maxScore: quizAttempts.maxScore,
                startedAt: quizAttempts.startedAt,
                completedAt: quizAttempts.completedAt,
                firstName: profiles.firstName,
                lastName: profiles.lastName,
                email: profiles.email,
            })
            .from(quizAttempts)
            .leftJoin(profiles, eq(quizAttempts.userId, profiles.id))
            .where(eq(quizAttempts.quizId, quizId))
            .orderBy(desc(quizAttempts.completedAt))

        return attempts
    } catch (error) {
        console.error("Error fetching quiz attempts:", error)
        return []
    }
}

export async function getPendingReviews(quizId: string) {
    try {
        const attempts = await db
            .select({
                id: quizAttempts.id,
                quizId: quizAttempts.quizId,
                userId: quizAttempts.userId,
                score: quizAttempts.score,
                maxScore: quizAttempts.maxScore,
                status: quizAttempts.status,
                startedAt: quizAttempts.startedAt,
                completedAt: quizAttempts.completedAt,
                firstName: profiles.firstName,
                lastName: profiles.lastName,
                email: profiles.email,
            })
            .from(quizAttempts)
            .leftJoin(profiles, eq(quizAttempts.userId, profiles.id))
            .where(and(
                eq(quizAttempts.quizId, quizId),
                eq(quizAttempts.status, "pending_review")
            ))
            .orderBy(desc(quizAttempts.completedAt))

        return attempts
    } catch (error) {
        console.error("Error fetching pending reviews:", error)
        return []
    }
}

export async function getPendingReviewsCount(quizId: string) {
    try {
        const result = await db
            .select()
            .from(quizAttempts)
            .where(and(
                eq(quizAttempts.quizId, quizId),
                eq(quizAttempts.status, "pending_review")
            ))
        return result.length
    } catch (error) {
        return 0
    }
}

export async function gradeShortAnswerAction(answerId: string, isCorrect: boolean) {
    try {
        // 1. Actualizar la respuesta
        const [updatedAnswer] = await db
            .update(quizAnswers)
            .set({ isCorrect })
            .where(eq(quizAnswers.id, answerId))
            .returning()

        if (!updatedAnswer) return { error: "Respuesta no encontrada" }

        // 2. Recalcular la nota total del intento
        const allAnswers = await db
            .select()
            .from(quizAnswers)
            .where(eq(quizAnswers.attemptId, updatedAnswer.attemptId))

        const [attempt] = await db
            .select()
            .from(quizAttempts)
            .where(eq(quizAttempts.id, updatedAnswer.attemptId))
            .limit(1)

        if (!attempt) return { error: "Intento no encontrado" }

        const questions = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, attempt.quizId))

        let newScore = 0
        for (const ans of allAnswers) {
            if (ans.isCorrect) {
                const q = questions.find(q => q.id === ans.questionId)
                if (q) newScore += q.points
            }
        }

        // 3. Verificar si quedan preguntas de texto por calificar en este intento
        // (Preguntas de tipo short_answer que tengan isCorrect === null)
        const pendingGrading = allAnswers.some(ans => {
            const q = questions.find(q => q.id === ans.questionId)
            return q?.type === "short_answer" && ans.isCorrect === null
        })

        // 4. Actualizar el intento
        const [updatedAttempt] = await db
            .update(quizAttempts)
            .set({
                score: newScore,
                status: pendingGrading ? "pending_review" : "completed"
            })
            .where(eq(quizAttempts.id, updatedAnswer.attemptId))
            .returning()

        return { success: true, data: updatedAttempt }
    } catch (error) {
        return { error: formatError(error).message }
    }
}
