"use client"

import { Plus, Type } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import QuestionForm from "../QuestionForm"
import QuestionItem from "./QuestionItem"

interface QuestionListProps {
    quiz: any
    quizId: string
    showNewQuestion: boolean
    setShowNewQuestion: (v: boolean) => void
    editingQuestionId: string | null
    setEditingQuestionId: (v: string | null) => void
    fetchQuiz: () => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export default function QuestionList({
    quiz, quizId,
    showNewQuestion, setShowNewQuestion,
    editingQuestionId, setEditingQuestionId,
    fetchQuiz, onEdit, onDelete
}: QuestionListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Preguntas ({quiz.questions?.length || 0})
                </h2>
                <button
                    onClick={() => {
                        setEditingQuestionId(null)
                        setShowNewQuestion(!showNewQuestion)
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                    <Plus size={14} />
                    Añadir Pregunta
                </button>
            </div>

            {/* New Question Form */}
            <AnimatePresence>
                {showNewQuestion && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <QuestionForm
                            quizId={quizId}
                            onSuccess={() => {
                                setShowNewQuestion(false)
                                fetchQuiz()
                            }}
                            onCancel={() => setShowNewQuestion(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Questions Items List */}
            <div className="space-y-4">
                {quiz.questions?.map((question: any, qIndex: number) => (
                    <div key={question.id}>
                        <AnimatePresence mode="wait">
                            {editingQuestionId === question.id ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <QuestionForm
                                        quizId={quizId}
                                        editingQuestion={question}
                                        qIndex={qIndex}
                                        onSuccess={() => {
                                            setEditingQuestionId(null)
                                            fetchQuiz()
                                        }}
                                        onCancel={() => setEditingQuestionId(null)}
                                    />
                                </motion.div>
                            ) : (
                                <QuestionItem 
                                    question={question}
                                    qIndex={qIndex}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {(!quiz.questions || quiz.questions.length === 0) && !showNewQuestion && (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-[20px] flex items-center justify-center mx-auto">
                            <Type size={28} className="text-slate-300" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 uppercase">Sin Preguntas</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Añade preguntas para completar el cuestionario.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNewQuestion(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                        >
                            <Plus size={14} />
                            Añadir Primera Pregunta
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
