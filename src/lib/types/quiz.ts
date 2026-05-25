// ─── Quiz System Types ──────────────────────────────────────────────

export type QuestionType = "single_choice" | "multiple_choice" | "true_false";
export type MediaType = "image" | "video" | "none";

export interface Quiz {
    id: string;
    sectionId: string;
    title: string;
    slug: string;
    description: string | null;
    imagePath: string | null;
    isPublished: boolean;
    timeLimitMinutes: number | null;
    randomizeQuestions: boolean;
    sortOrder: number;
    passingScore: number;
    requiredQuizId: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Relaciones opcionales
    questions?: QuizQuestion[];
    section?: { name: string; slug: string };
    _count?: { questions: number; attempts: number };
}

export interface QuizQuestion {
    id: string;
    quizId: string;
    text: string;
    type: QuestionType;
    mediaUrl: string | null;
    mediaType: MediaType;
    maxSelections: number | null;
    sortOrder: number;
    points: number;
    topic: string | null;
    createdAt: Date;
    // Relaciones opcionales
    options?: QuizOption[];
}

export interface QuizOption {
    id: string;
    questionId: string;
    text: string;
    isCorrect: boolean;
    sortOrder: number;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    score: number | null;
    maxScore: number | null;
    startedAt: Date;
    completedAt: Date | null;
    // Relaciones opcionales
    answers?: QuizAnswer[];
    quiz?: Quiz;
    user?: { firstName: string; lastName: string; email: string };
}

export interface QuizAnswer {
    id: string;
    attemptId: string;
    questionId: string;
    selectedOptions: string[]; // UUIDs
    textAnswer: string | null;
    isCorrect: boolean | null;
}

// ─── Input types para formularios ───────────────────────────────────

export interface CreateQuizInput {
    sectionId: string;
    title: string;
    description?: string;
    imagePath?: string | null;
    timeLimitMinutes?: number | null;
    randomizeQuestions?: boolean;
    passingScore?: number;
    requiredQuizId?: string | null;
}

export interface CreateQuestionInput {
    quizId: string;
    text: string;
    type: QuestionType;
    mediaUrl?: string;
    mediaType?: MediaType;
    maxSelections?: number;
    points?: number;
    topic?: string;
    options?: { text: string; isCorrect: boolean }[];
}

export interface SubmitAnswerInput {
    attemptId: string;
    questionId: string;
    selectedOptions?: string[];
    textAnswer?: string;
}
