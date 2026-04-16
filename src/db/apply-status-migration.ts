import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for raw SQL or just use postgres connection string

// Since we are likely using Drizzle with a connection string, it's better to use that.
// Let's check how drizzle is initialized in the project.
