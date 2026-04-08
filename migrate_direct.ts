import postgres from "postgres";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
    console.log("Starting manual migration with raw postgres...");
    const query = fs.readFileSync("./drizzle/0002_conscious_longshot.sql", "utf-8");
    const statements = query.split("--> statement-breakpoint");
    for (const statement of statements) {
        if (statement.trim()) {
            console.log("Executing statement...");
            await sql.unsafe(statement);
        }
    }
    console.log("Migration completed successfully!");
    await sql.end();
    process.exit(0);
}

main().catch(async err => {
    console.error("Migration failed:", err);
    await sql.end();
    process.exit(1);
});
