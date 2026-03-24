import { pgTable, uuid, text, jsonb, timestamp, unique, pgEnum, integer } from "drizzle-orm/pg-core";

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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 0.5. RELACIÓN PERFILES - SECCIONES (Permisos granulares)
export const profileSections = pgTable("profile_sections", {
    profileId: uuid("profile_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    sectionId: uuid("section_id")
        .references(() => sections.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    unique().on(t.profileId, t.sectionId),
]);

// 1. SECCIONES
export const sections = pgTable("sections", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
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
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").default({}),
    isRead: timestamp("is_read", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
