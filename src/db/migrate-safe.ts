import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("ERROR: No se encontró DATABASE_URL en .env.local");
    process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function main() {
    console.log("Iniciando migración segura...");
    try {
        const sqlContent = fs.readFileSync(path.join(process.cwd(), "drizzle", "0001_foamy_madame_hydra.sql"), "utf-8");
        const statements = sqlContent.split("--> statement-breakpoint");
        
        for (const stmt of statements) {
            const query = stmt.trim();
            if (!query) continue;
            
            try {
                await sql.unsafe(query);
                console.log("SUCCESS:", query.substring(0, 50).replace(/\n/g, ' ') + "...");
            } catch (err: any) {
                if (err.code === '42710' || err.code === '42P07') {
                    // Duplicate type or table
                    console.log("SKIPPED (already exists):", query.substring(0, 50).replace(/\n/g, ' ') + "...");
                } else if (err.code === '42701') {
                    // Duplicate column
                    console.log("SKIPPED (column exists):", query.substring(0, 50).replace(/\n/g, ' ') + "...");
                } else if (err.code === '42710') {
                    // Duplicate constraint
                    console.log("SKIPPED (constraint exists):", query.substring(0, 50).replace(/\n/g, ' ') + "...");
                } else {
                    console.error("FAILED:", query.substring(0, 50).replace(/\n/g, ' ') + "...");
                    console.error("Error original:", err);
                }
            }
        }
        
    } finally {
        await sql.end();
        console.log("Migración completada.");
    }
}

main();
