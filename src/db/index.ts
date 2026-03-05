import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Cargar variables de entorno si estamos en un entorno que lo necesite (aunque Next.js ya lo hace)
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
