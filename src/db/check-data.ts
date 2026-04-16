import { db } from "./index";
import { profiles, sections, quizzes, quizQuestions } from "./schema";
import { sql } from "drizzle-orm";

async function checkData() {
    console.log("--- Verificando estado de los datos ---");
    
    try {
        const profileCount = await db.select({ count: sql`count(*)` }).from(profiles);
        const sectionCount = await db.select({ count: sql`count(*)` }).from(sections);
        const quizCount = await db.select({ count: sql`count(*)` }).from(quizzes);
        const questionCount = await db.select({ count: sql`count(*)` }).from(quizQuestions);

        console.log(`Perfiles: ${profileCount[0].count}`);
        console.log(`Secciones: ${sectionCount[0].count}`);
        console.log(`Quizzes: ${quizCount[0].count}`);
        console.log(`Preguntas de Quiz: ${questionCount[0].count}`);
        
        console.log("--------------------------------------");
    } catch (error) {
        console.error("Error consultando datos:", error);
    }
    process.exit(0);
}

checkData();
