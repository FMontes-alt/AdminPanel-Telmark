import { AlertService } from "../src/services/alerts/alert-services"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

async function test() {
    console.log("Triggering test alert...")
    // This will fail if DB connection is not initialized in AlertService
    // But since createAlert uses db from @/db, it should work if DATABASE_URL is set.
    try {
        await AlertService.sectionCreated("Sección de Prueba", "00000000-0000-0000-0000-000000000000", "seccion-de-prueba")
        console.log("Alert triggered successfully!")
    } catch (e) {
        console.error("Error triggering alert:", e)
    }
}

test()
