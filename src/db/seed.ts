/**
 * seed.ts — Script principal de seeding.
 *
 * ¿Qué hace?
 * 1. Limpia todas las tablas (en orden inverso para respetar foreign keys).
 * 2. Inserta datos de las factories en orden: sections → categories →
 *    subcategories → items.
 * 3. Muestra un resumen de lo insertado.
 *
 * ¿Cómo se ejecuta?
 *   npm run seed
 *
 * ¿Por qué usamos SQL directo para limpiar?
 * Drizzle no tiene un método .truncate() directo, así que usamos
 * db.delete(tabla) que borra todas las filas. Gracias a ON DELETE CASCADE
 * en el schema, borrar sections automáticamente borra categories,
 * subcategories e items asociados. Pero borramos todo explícitamente
 * para mayor claridad.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import {
    createSections,
    createCategories,
    createSubcategories,
    createItems,
} from "./factories";

// ─── Conexión ───────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("ERROR: No se encontró DATABASE_URL en .env.local");
    process.exit(1);
}

// Usamos max: 1 para el seeder (no necesitamos pool de conexiones)
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

// ─── Función principal ──────────────────────────────────────────────────

async function seed() {
    console.log("Iniciando seeding de la base de datos...\n");

    // ── Paso 1: Limpiar tablas ──────────────────────────────────────────
    console.log("Limpiando tablas existentes...");
    await db.delete(schema.items);
    await db.delete(schema.subcategories);
    await db.delete(schema.categories);
    await db.delete(schema.profileSections);
    await db.delete(schema.sections);
    // No borramos profiles porque están atados a auth.users de Supabase
    console.log("   Tablas limpiadas\n");

    // ── Paso 2: Insertar SECTIONS ───────────────────────────────────────
    console.log("\nInsertando SECTIONS...");
    const sectionsData = createSections();
    const insertedSections = await db
        .insert(schema.sections)
        .values(sectionsData)
        .returning();

    // Crear un mapa slug → id para asociar las categorías
    const sectionMap = new Map<string, string>();
    for (const section of insertedSections) {
        sectionMap.set(section.slug, section.id);
        console.log(`   ${section.name}`);
    }

    // Nota: PROFILE_SECTIONS no se puede popular dinámicamente aquí porque
    // depende de los UUIDs reales de los usuarios registrados en Supabase Auth.
    // Esto se gestionará desde el Panel de Administración.

    // ── Paso 3: Insertar CATEGORIES ─────────────────────────────────────
    console.log("\nInsertando CATEGORIES...");
    const categoriesData = createCategories();
    const categoryMap = new Map<string, string>();

    for (const [sectionSlug, cats] of Object.entries(categoriesData)) {
        const sectionId = sectionMap.get(sectionSlug);
        if (!sectionId) continue;

        const catsWithSectionId = cats.map((cat) => ({ ...cat, sectionId }));
        const insertedCats = await db.insert(schema.categories).values(catsWithSectionId).returning();

        for (const cat of insertedCats) {
            categoryMap.set(cat.slug, cat.id);
            console.log(`   ${cat.name} (sección: ${sectionSlug})`);
        }
    }

    // ── Paso 4: Insertar SUBCATEGORIES ──────────────────────────────────
    console.log("\nInsertando SUBCATEGORIES...");
    const subcategoriesData = createSubcategories();
    const subcategoryMap = new Map<string, string>();

    for (const [categorySlug, subcats] of Object.entries(subcategoriesData)) {
        const categoryId = categoryMap.get(categorySlug);
        if (!categoryId) continue;

        const subcatsWithCategoryId = subcats.map((subcat) => ({ ...subcat, categoryId }));
        const insertedSubcats = await db.insert(schema.subcategories).values(subcatsWithCategoryId).returning();

        for (const subcat of insertedSubcats) {
            subcategoryMap.set(subcat.slug, subcat.id);
            console.log(`   ${subcat.name} (categoría: ${categorySlug})`);
        }
    }

    // ── Paso 5: Insertar ITEMS ──────────────────────────────────────────
    console.log("\nInsertando ITEMS...");
    const itemsData = createItems();
    let totalItems = 0;

    for (const [subcategorySlug, itemsList] of Object.entries(itemsData)) {
        const subcategoryId = subcategoryMap.get(subcategorySlug);
        if (!subcategoryId) continue;

        const itemsWithSubcategoryId = itemsList.map((item) => ({ ...item, subcategoryId }));
        const insertedItems = await db.insert(schema.items).values(itemsWithSubcategoryId).returning();

        for (const item of insertedItems) {
            console.log(`   ${item.title}`);
            totalItems++;
        }
    }

    // ── Resumen ─────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(50));
    console.log("SEEDING COMPLETADO");
    console.log("═".repeat(50));
    console.log(`   Sections:      ${insertedSections.length}`);
    console.log(`   Categories:    ${categoryMap.size}`);
    console.log(`   Subcategories: ${subcategoryMap.size}`);
    console.log(`   Items:         ${totalItems}`);
    console.log("═".repeat(50));
}

// ─── Ejecutar ───────────────────────────────────────────────────────────

seed()
    .then(() => {
        console.log("\nProceso finalizado correctamente.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nError durante el seeding:", error);
        process.exit(1);
    });
