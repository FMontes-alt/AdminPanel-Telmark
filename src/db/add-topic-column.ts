import * as dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function main() {
    console.log("Adding 'topic' column to quiz_questions...");
    try {
        await sql.unsafe(`ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS topic TEXT;`);
        console.log("SUCCESS: Column added or already exists.");
    } catch (err) {
        console.error("FAILED to add column:", err);
    } finally {
        await sql.end();
    }
}

main();
