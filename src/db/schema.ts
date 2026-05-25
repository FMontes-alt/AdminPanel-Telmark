import { pgTable, uuid, text, jsonb, timestamp, unique, pgEnum, integer, boolean } from "drizzle-orm/pg-core";

// Enum roles
export const userRoleEnum = pgEnum("user_role", ["superadmin", "admin", "usuario"]);

// 0. USUARIOS
export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").unique().notNull(),
    phone: text("phone"),
    role: userRoleEnum("role").default("usuario").notNull(),
    avatarUrl: text("avatar_url"),
    assignedSectionIds: uuid("assigned_section_ids").array(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 1. SECCIONES
export const sections = pgTable("sections", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    imagePath: text("image_path"),
    config: jsonb("config").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. CATEGORIAS
export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
        .references(() => sections.id, { onDelete: "cascade" })
        .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    sortOrder: integer("sort_order").default(0),
}, (t) => [
    unique().on(t.sectionId, t.slug),
]);

// 3. SUBCATEGORIAS
export const subcategories = pgTable("subcategories", {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
        .references(() => categories.id, { onDelete: "cascade" })
        .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    unique().on(t.categoryId, t.slug),
]);

// 4. ITEMS (Contenido)
export const items = pgTable("items", {
    id: uuid("id").primaryKey().defaultRandom(),
    subcategoryId: uuid("subcategory_id")
        .references(() => subcategories.id, { onDelete: "cascade" })
        .notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    body: text("body"),
    filePath: text("file_path"),
    externalLink: text("external_link"),
    contentType: text("content_type", { enum: ["info", "document", "file", "link", "video"] }).default("info"),
    attributes: jsonb("attributes").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    unique().on(t.subcategoryId, t.slug),
]);

// 5. ALERTAS Y EVENTOS DEL SISTEMA
export const alertTypeEnum = pgEnum("alert_type", ["error", "lock", "unlock", "delete", "create", "edit", "system"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["info", "warning", "critical"]);

export const alerts = pgTable("alerts", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: alertTypeEnum("type").notNull(),
    severity: alertSeverityEnum("severity").default("info").notNull(),
    message: text("message").notNull(),
    targetId: uuid("target_id"), // ID genérico para secciones, items, etc.
    targetName: text("target_name"),
    targetUrl: text("target_url"),
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").default({}),
    isRead: timestamp("is_read", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. GRUPOS Y PERMISOS AVANZADOS
export const permissionTargetEnum = pgEnum("permission_target", ["section", "category", "subcategory", "item"]);

export const groups = pgTable("groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userGroups = pgTable("user_groups", {
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    groupId: uuid("group_id")
        .references(() => groups.id, { onDelete: "cascade" })
        .notNull(),
}, (t) => [
    unique().on(t.userId, t.groupId),
]);

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
        .references(() => groups.id, { onDelete: "cascade" }),
    targetType: permissionTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── QUIZ SYSTEM ────────────────────────────────────────────────────────

// Enums
export const questionTypeEnum = pgEnum("question_type", [
    "short_answer",
    "single_choice",
    "multiple_choice",
    "true_false",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "none"]);

export const attemptStatusEnum = pgEnum("attempt_status", ["in_progress", "pending_review", "completed"]);

// 7. CUESTIONARIOS
export const quizzes = pgTable("quizzes", {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
        .references(() => sections.id, { onDelete: "cascade" })
        .notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imagePath: text("image_path"),
    isPublished: boolean("is_published").default(false).notNull(),
    timeLimitMinutes: integer("time_limit_minutes"), // null = sin límite
    randomizeQuestions: boolean("randomize_questions").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    passingScore: integer("passing_score").default(80).notNull(),
    requiredQuizId: uuid("required_quiz_id").references((): any => quizzes.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    unique().on(t.sectionId, t.slug),
]);

// 8. PREGUNTAS
export const quizQuestions = pgTable("quiz_questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
        .references(() => quizzes.id, { onDelete: "cascade" })
        .notNull(),
    text: text("text").notNull(),
    type: questionTypeEnum("type").notNull(),
    mediaUrl: text("media_url"),
    mediaType: mediaTypeEnum("media_type").default("none").notNull(),
    maxSelections: integer("max_selections"), // solo para multiple_choice
    sortOrder: integer("sort_order").default(0).notNull(),
    points: integer("points").default(1).notNull(),
    topic: text("topic"), // null = sin tema específico
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. OPCIONES DE RESPUESTA
export const quizOptions = pgTable("quiz_options", {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
        .references(() => quizQuestions.id, { onDelete: "cascade" })
        .notNull(),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
});

// 10. INTENTOS DE CUESTIONARIO
export const quizAttempts = pgTable("quiz_attempts", {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
        .references(() => quizzes.id, { onDelete: "cascade" })
        .notNull(),
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    score: integer("score"),
    maxScore: integer("max_score"),
    status: attemptStatusEnum("status").default("completed").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
});

// 11. RESPUESTAS INDIVIDUALES
export const quizAnswers = pgTable("quiz_answers", {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
        .references(() => quizAttempts.id, { onDelete: "cascade" })
        .notNull(),
    questionId: uuid("question_id")
        .references(() => quizQuestions.id, { onDelete: "cascade" })
        .notNull(),
    selectedOptions: jsonb("selected_options").default([]), // Array de UUIDs
    textAnswer: text("text_answer"),
    isCorrect: boolean("is_correct"),
});
