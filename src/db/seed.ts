import { db } from "./index";
import { sections } from "./schema";

async function main() {
  console.log("Seeding base sections...");

  const baseSections = [
    { name: "ADESLAS", slug: "adeslas" },
    { name: "ENERGÍA", slug: "energia" },
    { name: "ALARMA", slug: "alarma" },
  ];

  for (const section of baseSections) {
    await db.insert(sections).values(section).onConflictDoNothing();
    console.log(`Checked/Inserted section: ${section.name}`);
  }

  console.log("Seeding completed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
