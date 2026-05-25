"use server"

import { db } from "@/db"
import { quizAttempts, quizAnswers, quizQuestions, quizOptions, profiles } from "@/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"

export async function getQuizAnalytics(quizId: string) {
    try {
        // 1. Obtener todas las preguntas del quiz
        const questions = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quizId))
            .orderBy(quizQuestions.sortOrder)

        // 2. Obtener todos los intentos completados
        const attempts = await db
            .select({
                id: quizAttempts.id,
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
            .where(and(
                eq(quizAttempts.quizId, quizId),
                sql`${quizAttempts.completedAt} IS NOT NULL`
            ))
            .orderBy(desc(quizAttempts.score))

        // 3. Obtener todas las respuestas para análisis detallado
        const allAnswers = await db
            .select()
            .from(quizAnswers)
            .where(sql`${quizAnswers.attemptId} IN (SELECT id FROM ${quizAttempts} WHERE quiz_id = ${quizId} AND completed_at IS NOT NULL)`)

        // 4. Calcular estadísticas por pregunta
        const questionStats = questions.map(q => {
            const answersToThis = allAnswers.filter(a => a.questionId === q.id)
            const correctCount = answersToThis.filter(a => a.isCorrect).length
            const totalCount = answersToThis.length
            
            return {
                id: q.id,
                text: q.text,
                topic: q.topic || "General",
                type: q.type,
                correctCount,
                wrongCount: totalCount - correctCount,
                successRate: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
                totalCount
            }
        })

        // 5. Agrupar por Tema
        const topics = Array.from(new Set(questionStats.map(s => s.topic)))
        const topicStats = topics.map(topic => {
            const statsInTopic = questionStats.filter(s => s.topic === topic)
            const avgSuccessRate = statsInTopic.length > 0 
                ? Math.round(statsInTopic.reduce((sum, s) => sum + s.successRate, 0) / statsInTopic.length)
                : 0
            
            return {
                topic,
                avgSuccessRate,
                questionCount: statsInTopic.length
            }
        }).sort((a, b) => a.avgSuccessRate - b.avgSuccessRate)

        // 6. Ranking de Usuarios (Agrupado por mejor marca personal)
        const userBestAttemptsMap = new Map<string, any>();

        attempts.forEach((a) => {
            const userId = a.userId!;
            const attemptData = {
                id: a.id,
                score: a.score,
                maxScore: a.maxScore,
                percentage: a.maxScore ? Math.round((a.score! / a.maxScore) * 100) : 0,
                date: a.completedAt
            };

            if (!userBestAttemptsMap.has(userId)) {
                userBestAttemptsMap.set(userId, {
                    userId,
                    name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Usuario',
                    email: a.email,
                    bestAttempt: attemptData,
                    history: [attemptData]
                });
            } else {
                const user = userBestAttemptsMap.get(userId);
                user.history.push(attemptData);
                // Si este intento es mejor que el guardado, lo actualizamos como "mejor marca"
                // (Aunque la query ya venga por score DESC, esto asegura robustez)
                if (attemptData.score! > user.bestAttempt.score!) {
                    user.bestAttempt = attemptData;
                }
            }
        });

        const userRanking = Array.from(userBestAttemptsMap.values())
            .sort((a, b) => b.bestAttempt.score - a.bestAttempt.score)
            .map((u, index) => ({
                id: u.bestAttempt.id, // ID del mejor intento para key de React
                userId: u.userId,
                rank: index + 1,
                name: u.name,
                email: u.email,
                score: u.bestAttempt.score,
                maxScore: u.bestAttempt.maxScore,
                percentage: u.bestAttempt.percentage,
                date: u.bestAttempt.date,
                history: u.history
            }))

        return {
            attemptsCount: attempts.length,
            uniqueUsersCount: userRanking.length,
            questionStats,
            topicStats,
            userRanking,
            overallSuccessRate: attempts.length > 0 
                ? Math.round(attempts.reduce((sum, a) => sum + (a.score! / a.maxScore!) * 100, 0) / attempts.length)
                : 0
        }
    } catch (error) {
        console.error("Error fetching quiz analytics:", error)
        return null
    }
}

export async function getUserQuizAnalytics(quizId: string, userId: string) {
    try {
        // 1. Obtener todas las preguntas del quiz
        const questions = await db
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, quizId))
            .orderBy(quizQuestions.sortOrder)

        // 2. Obtener todos los intentos del usuario para este quiz
        const attempts = await db
            .select()
            .from(quizAttempts)
            .where(and(
                eq(quizAttempts.quizId, quizId),
                eq(quizAttempts.userId, userId),
                sql`${quizAttempts.completedAt} IS NOT NULL`
            ))
            .orderBy(desc(quizAttempts.score)) // El mejor intento primero

        if (attempts.length === 0) return null

        const bestAttempt = attempts[0]

        // 3. Obtener las respuestas del usuario para ese mejor intento
        const answers = await db
            .select()
            .from(quizAnswers)
            .where(eq(quizAnswers.attemptId, bestAttempt.id))

        // 4. Mapear preguntas con las respuestas del usuario
        const questionsWithAnswers = await Promise.all(
            questions.map(async (q) => {
                const options = await db
                    .select()
                    .from(quizOptions)
                    .where(eq(quizOptions.questionId, q.id))
                    .orderBy(quizOptions.sortOrder)
                const answer = answers.find(a => a.questionId === q.id)
                return {
                    ...q,
                    options,
                    userAnswer: answer || null
                }
            })
        )

        // 5. Agrupar aciertos por tema
        const topicAnalysisMap = new Map<string, { correct: number; total: number }>()
        questionsWithAnswers.forEach(q => {
            const topic = q.topic || "General"
            const current = topicAnalysisMap.get(topic) || { correct: 0, total: 0 }
            current.total += 1
            if (q.userAnswer?.isCorrect) {
                current.correct += 1
            }
            topicAnalysisMap.set(topic, current)
        })

        const topicAnalysis = Array.from(topicAnalysisMap.entries()).map(([topic, stats]) => ({
            topic,
            correct: stats.correct,
            total: stats.total,
            percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
        }))

        return {
            bestAttempt,
            attemptsCount: attempts.length,
            attempts,
            questions: questionsWithAnswers,
            topicAnalysis
        }
    } catch (error) {
        console.error("Error fetching user quiz analytics:", error)
        return null
    }
}
