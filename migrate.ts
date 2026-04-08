import { db } from "./src/db/index";
import { sql } from "drizzle-orm";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("Starting manual migration...");
    const query = fs.readFileSync("./drizzle/0002_conscious_longshot.sql", "utf-8");
    const statements = query.split("--> statement-breakpoint");
    for (const statement of statements) {
        if (statement.trim()) {
            console.log("Executing statement...");
            await db.execute(sql.raw(statement));
        }
    }
    console.log("Migration completed successfully!");
    process.exit(0);
}

main().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
