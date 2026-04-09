"use server"

import { db } from "@/db"
import { quizQuestions, quizOptions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { formatError } from "@/lib/error-handler"
import type { CreateQuestionInput, QuestionType, MediaType } from "@/lib/types/quiz"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getQuestions(quizId: string) {
    try {
        const questions = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quizId))
            .orderBy(quizQuestions.sortOrder)

        const questionsWithOptions = await Promise.all(
            questions.map(async (q) => {
                const options = await db
                    .select()
                    .from(quizOptions)
                    .where(eq(quizOptions.questionId, q.id))
                    .orderBy(quizOptions.sortOrder)
                return { ...q, options }
            })
        )

        return questionsWithOptions
    } catch (error) {
        console.error("Error fetching questions:", error)
        return []
    }
}

export async function getQuestionById(questionId: string) {
    try {
        const [question] = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.id, questionId))
            .limit(1)

        if (!question) return null

        const options = await db
            .select()
            .from(quizOptions)
            .where(eq(quizOptions.questionId, questionId))
            .orderBy(quizOptions.sortOrder)

        return { ...question, options }
    } catch (error) {
        console.error("Error fetching question:", error)
        return null
    }
}

// ─── CREATE ─────────────────────────────────────────────────────────────

export async function createQuestion(data: CreateQuestionInput) {
    try {
        // Obtener el siguiente sortOrder
        const existing = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, data.quizId))
        const nextOrder = existing.length

        const [newQuestion] = await db
            .insert(quizQuestions)
            .values({
                quizId: data.quizId,
                text: data.text,
                type: data.type as QuestionType,
                mediaUrl: data.mediaUrl || null,
                mediaType: (data.mediaType || "none") as MediaType,
                maxSelections: data.type === "multiple_choice" ? (data.maxSelections || 2) : null,
                sortOrder: nextOrder,
                points: data.points || 1,
                topic: data.topic || null,
            })
            .returning()

        // Crear opciones si se proporcionan
        if (data.options && data.options.length > 0) {
            await db.insert(quizOptions).values(
                data.options.map((opt, index) => ({
                    questionId: newQuestion.id,
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    sortOrder: index,
                }))
            )
        }

        // Para true_false, crear automáticamente las 2 opciones si no se proporcionaron
        if (data.type === "true_false" && (!data.options || data.options.length === 0)) {
            await db.insert(quizOptions).values([
                { questionId: newQuestion.id, text: "Verdadero", isCorrect: true, sortOrder: 0 },
                { questionId: newQuestion.id, text: "Falso", isCorrect: false, sortOrder: 1 },
            ])
        }

        revalidatePath("/admin/quizzes")
        return { success: true, data: newQuestion }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

export async function updateQuestion(
    questionId: string,
    data: {
        text?: string;
        type?: QuestionType;
        mediaUrl?: string | null;
        mediaType?: MediaType;
        maxSelections?: number | null;
        points?: number;
        topic?: string;
        options?: { id?: string; text: string; isCorrect: boolean }[];
    }
) {
    try {
        const updateData: any = {}
        if (data.text !== undefined) updateData.text = data.text
        if (data.type !== undefined) updateData.type = data.type
        if (data.mediaUrl !== undefined) updateData.mediaUrl = data.mediaUrl
        if (data.mediaType !== undefined) updateData.mediaType = data.mediaType
        if (data.maxSelections !== undefined) updateData.maxSelections = data.maxSelections
        if (data.points !== undefined) updateData.points = data.points
        if (data.topic !== undefined) updateData.topic = data.topic

        if (Object.keys(updateData).length > 0) {
            await db
                .update(quizQuestions)
                .set(updateData)
                .where(eq(quizQuestions.id, questionId))
        }

        // Actualizar opciones: borrar las existentes y recrear
        if (data.options !== undefined) {
            await db.delete(quizOptions).where(eq(quizOptions.questionId, questionId))
            if (data.options.length > 0) {
                await db.insert(quizOptions).values(
                    data.options.map((opt, index) => ({
                        questionId,
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        sortOrder: index,
                    }))
                )
            }
        }

        revalidatePath("/admin/quizzes")
        return { success: true }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

// ─── REORDER ────────────────────────────────────────────────────────────

export async function reorderQuestions(questionIds: string[]) {
    try {
        await Promise.all(
            questionIds.map((id, index) =>
                db.update(quizQuestions).set({ sortOrder: index }).where(eq(quizQuestions.id, id))
            )
        )
        revalidatePath("/admin/quizzes")
        return { success: true }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteQuestion(questionId: string) {
    try {
        await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId))
        revalidatePath("/admin/quizzes")
        return { success: true }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}
