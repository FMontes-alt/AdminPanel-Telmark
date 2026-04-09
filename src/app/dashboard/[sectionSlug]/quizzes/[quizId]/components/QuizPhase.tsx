"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle2, ArrowLeft, ArrowRight, Send } from "lucide-react"

interface QuizPhaseProps {
    currentIndex: number
    totalQuestions: number
    currentQuestion: any
    timeLeft: number | null
    formatTime: (s: number) => string
    onPrev: () => void
    onNext: () => void
    onFinish: () => void
    onSelectOption: (id: string) => void
    onTextAnswer: (text: string) => void
    isOptionDisabled: (id: string) => boolean
    selectedOptions: string[]
    textAnswer: string
    submitting: boolean
    isLastQuestion: boolean
}

export default function QuizPhase({
    currentIndex,
    totalQuestions,
    currentQuestion,
    timeLeft,
    formatTime,
    onPrev,
    onNext,
    onFinish,
    onSelectOption,
    onTextAnswer,
    isOptionDisabled,
    selectedOptions,
    textAnswer,
    submitting,
    isLastQuestion
}: QuizPhaseProps) {
    if (!currentQuestion) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {currentIndex + 1} / {totalQuestions}
                    </span>
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>
                {timeLeft !== null && (
                    <div className={`flex items-center gap-1.5 text-sm font-black ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                        <Clock size={14} />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Question Content */}
            <div className="flex-1 flex items-center justify-center p-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="max-w-2xl w-full space-y-8"
                    >
                        {/* Media */}
                        {currentQuestion.mediaUrl && currentQuestion.mediaType !== "none" && (
                            <div className="rounded-[24px] overflow-hidden border border-slate-200 shadow-sm bg-white">
                                {currentQuestion.mediaType === "image" ? (
                                    <img src={currentQuestion.mediaUrl} alt="Pregunta" className="w-full max-h-72 object-contain bg-slate-50" />
                                ) : (
                                    <video src={currentQuestion.mediaUrl} controls className="w-full max-h-72" />
                                )}
                            </div>
                        )}

                        {/* Question Text */}
                        <div className="text-center">
                            <p className="text-xl font-black text-slate-900 leading-relaxed uppercase tracking-tight">{currentQuestion.text}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                {currentQuestion.points} punto{currentQuestion.points > 1 ? "s" : ""}
                                {currentQuestion.type === "multiple_choice" && currentQuestion.maxSelections && (
                                    <span className="ml-2">
                                        · Máximo {currentQuestion.maxSelections} ({selectedOptions.length}/{currentQuestion.maxSelections})
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Options */}
                        {(currentQuestion.type === "single_choice" || currentQuestion.type === "multiple_choice") && (
                            <div className="space-y-3">
                                {currentQuestion.options?.map((opt: any) => {
                                    const isSelected = selectedOptions.includes(opt.id)
                                    const disabled = isOptionDisabled(opt.id)
                                    return (
                                        <motion.button
                                            key={opt.id}
                                            whileTap={!disabled ? { scale: 0.98 } : {}}
                                            onClick={() => !disabled && onSelectOption(opt.id)}
                                            disabled={disabled}
                                            className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all ${
                                                isSelected
                                                    ? "border-blue-600 bg-blue-50 text-blue-800 shadow-lg shadow-blue-500/10"
                                                    : disabled ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50" : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 text-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? "border-blue-600 bg-blue-600" : "border-slate-200"}`}>
                                                    {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-bold">{opt.text}</span>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        )}

                        {currentQuestion.type === "true_false" && (
                            <div className="grid grid-cols-2 gap-4">
                                {currentQuestion.options?.map((opt: any) => {
                                    const isSelected = selectedOptions.includes(opt.id)
                                    const isTrue = opt.text.toLowerCase() === "verdadero"
                                    return (
                                        <motion.button
                                            key={opt.id}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => onSelectOption(opt.id)}
                                            className={`py-6 rounded-2xl font-black text-lg transition-all border-2 ${
                                                isSelected ? (isTrue ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                            }`}
                                        >
                                            {opt.text}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        )}

                        {currentQuestion.type === "short_answer" && (
                            <textarea
                                value={textAnswer}
                                onChange={(e) => onTextAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                rows={4}
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium text-slate-700 outline-none focus:border-blue-300 transition-all resize-none"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between sticky bottom-0">
                <button
                    onClick={onPrev}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-30"
                >
                    <ArrowLeft size={14} /> Anterior
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={onFinish}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
                    >
                        <Send size={14} /> {submitting ? "Enviando..." : "Finalizar"}
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                        Siguiente <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}
