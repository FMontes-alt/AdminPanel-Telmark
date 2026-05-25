"use server"

import { db } from "@/db"
import { quizzes, quizQuestions, quizOptions, quizAttempts, sections } from "@/db/schema"
import { eq, desc, and, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { formatError } from "@/lib/error-handler"
import type { CreateQuizInput } from "@/lib/types/quiz"
import { deleteMultipleFilesAction } from "./storage"

// ─── READ ───────────────────────────────────────────────────────────────

export async function getQuizzes(sectionId?: string) {
    try {
        const baseQuery = db
            .select({
                id: quizzes.id,
                sectionId: quizzes.sectionId,
                title: quizzes.title,
                slug: quizzes.slug,
                description: quizzes.description,
                isPublished: quizzes.isPublished,
                timeLimitMinutes: quizzes.timeLimitMinutes,
                randomizeQuestions: quizzes.randomizeQuestions,
                sortOrder: quizzes.sortOrder,
                passingScore: quizzes.passingScore,
                requiredQuizId: quizzes.requiredQuizId,
                createdAt: quizzes.createdAt,
                updatedAt: quizzes.updatedAt,
                sectionName: sections.name,
            })
            .from(quizzes)
            .leftJoin(sections, eq(quizzes.sectionId, sections.id))
            .orderBy(quizzes.sortOrder)

        if (sectionId) {
            return baseQuery.where(eq(quizzes.sectionId, sectionId))
        }
        return baseQuery
    } catch (error) {
        console.error("Error fetching quizzes:", error)
        return []
    }
}

export async function getQuizById(quizId: string) {
    try {
        const [quiz] = await db
            .select()
            .from(quizzes)
            .where(eq(quizzes.id, quizId))
            .limit(1)

        if (!quiz) return null

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

        return { ...quiz, questions: questionsWithOptions }
    } catch (error) {
        console.error("Error fetching quiz:", error)
        return null
    }
}

export async function getQuizBySlug(sectionId: string, slug: string) {
    try {
        const [quiz] = await db
            .select()
            .from(quizzes)
            .where(and(eq(quizzes.sectionId, sectionId), eq(quizzes.slug, slug)))
            .limit(1)
        return quiz ?? null
    } catch (error) {
        console.error("Error fetching quiz by slug:", error)
        return null
    }
}

export async function getQuizWithDetailsBySlug(slug: string) {
    try {
        const [quiz] = await db
            .select()
            .from(quizzes)
            .where(eq(quizzes.slug, slug))
            .limit(1)

        if (!quiz) return null

        const questions = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quiz.id))
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

        return { ...quiz, questions: questionsWithOptions }
    } catch (error) {
        console.error("Error fetching quiz with details by slug:", error)
        return null
    }
}

export async function getPublishedQuizzes(sectionId: string) {
    try {
        return db
            .select()
            .from(quizzes)
            .where(and(eq(quizzes.sectionId, sectionId), eq(quizzes.isPublished, true)))
            .orderBy(quizzes.sortOrder)
    } catch (error) {
        console.error("Error fetching published quizzes:", error)
        return []
    }
}

export async function getQuizQuestionCount(quizId: string) {
    try {
        const [result] = await db
            .select({ count: count() })
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quizId))
        return result?.count ?? 0
    } catch (error) {
        return 0
    }
}

// ─── CREATE ─────────────────────────────────────────────────────────────

export async function createQuiz(data: CreateQuizInput) {
    try {
        const slug = data.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")

        // Auto-calcular sortOrder: total de quizzes en la sección + 1
        const existingQuizzes = await db
            .select({ count: count() })
            .from(quizzes)
            .where(eq(quizzes.sectionId, data.sectionId))
        const sortOrder = (existingQuizzes[0]?.count ?? 0) + 1

        const [newQuiz] = await db
            .insert(quizzes)
            .values({
                sectionId: data.sectionId,
                title: data.title,
                slug,
                description: data.description || null,
                timeLimitMinutes: data.timeLimitMinutes || null,
                randomizeQuestions: data.randomizeQuestions || false,
                sortOrder,
                passingScore: data.passingScore !== undefined ? data.passingScore : 80,
                requiredQuizId: data.requiredQuizId || null,
            })
            .returning()

        revalidatePath("/admin/quizzes")
        return { success: true, data: newQuiz }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

// ─── UPDATE ─────────────────────────────────────────────────────────────

export async function updateQuiz(quizId: string, data: Partial<CreateQuizInput> & { isPublished?: boolean }) {
    try {
        const updateData: any = { updatedAt: new Date() }
        if (data.title !== undefined) {
            updateData.title = data.title
            updateData.slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        }
        if (data.description !== undefined) updateData.description = data.description
        if (data.sectionId !== undefined) updateData.sectionId = data.sectionId
        if (data.timeLimitMinutes !== undefined) updateData.timeLimitMinutes = data.timeLimitMinutes
        if (data.randomizeQuestions !== undefined) updateData.randomizeQuestions = data.randomizeQuestions
        if (data.isPublished !== undefined) updateData.isPublished = data.isPublished
        if (data.passingScore !== undefined) updateData.passingScore = data.passingScore
        if (data.requiredQuizId !== undefined) updateData.requiredQuizId = data.requiredQuizId

        const [updated] = await db
            .update(quizzes)
            .set(updateData)
            .where(eq(quizzes.id, quizId))
            .returning()

        revalidatePath("/admin/quizzes")
        return { success: true, data: updated }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}

export async function publishQuiz(quizId: string, publish: boolean) {
    return updateQuiz(quizId, { isPublished: publish })
}

// ─── DELETE ─────────────────────────────────────────────────────────────

export async function deleteQuiz(quizId: string) {
    try {
        // 1. Limpiar storage de todas las preguntas del quiz
        const questions = await db
            .select({ mediaUrl: quizQuestions.mediaUrl })
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quizId))

        const filePaths = questions
            .map(q => q.mediaUrl)
            .filter((url): url is string => !!url && !url.startsWith('http'))

        if (filePaths.length > 0) {
            try {
                await deleteMultipleFilesAction(filePaths)
            } catch (e) {
                console.error("Error eliminando archivos de storage al borrar quiz:", e)
            }
        }

        await db.delete(quizzes).where(eq(quizzes.id, quizId))
        revalidatePath("/admin/quizzes")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        const formatted = formatError(error)
        return { error: formatted.message }
    }
}
