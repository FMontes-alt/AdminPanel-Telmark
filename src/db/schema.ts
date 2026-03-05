import { pgTable, uuid, text, jsonb, timestamp, unique, pgEnum } from "drizzle-orm/pg-core";

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
    contentType: text("content_type", { enum: ["info", "document", "file", "link"] }).default("info"),
    attributes: jsonb("attributes").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    unique().on(t.subcategoryId, t.slug),
]);
