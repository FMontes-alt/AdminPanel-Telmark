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
    console.log("Adding 'attempt_status' enum and 'status' column to quiz_attempts...");
    try {
        // Create enum if not exists
        await sql.unsafe(`
            DO $$ BEGIN
                CREATE TYPE attempt_status AS ENUM ('in_progress', 'pending_review', 'completed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // Add column with default 'completed' for existing records
        await sql.unsafe(`
            ALTER TABLE quiz_attempts 
            ADD COLUMN IF NOT EXISTS status attempt_status DEFAULT 'completed' NOT NULL;
        `);
        
        console.log("SUCCESS: Schema updated.");
    } catch (err) {
        console.error("FAILED to update schema:", err);
    } finally {
        await sql.end();
    }
}

main();
