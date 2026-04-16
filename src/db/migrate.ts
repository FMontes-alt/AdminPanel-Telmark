import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("ERROR: No se encontró DATABASE_URL en .env.local");
    process.exit(1);
}

// max: 1 para las migraciones
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
    console.log("Iniciando migración de la base de datos...");
    try {
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Migración completada exitosamente.");
    } catch (error) {
        console.error("Error durante la migración:", error);
        process.exit(1);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

main();
