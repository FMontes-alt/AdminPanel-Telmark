import { db } from '@/db'
import { sections as sectionsTable } from '@/db/schema'

export default async function TestPage() {
    try {
        // ¡Usando Drizzle por primera vez!
        const sections = await db.select().from(sectionsTable)

        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold mb-4">Conexión con Drizzle ORM: ✅</h1>
                <pre className="bg-slate-100 p-4 rounded text-black">
                    {JSON.stringify(sections, null, 2)}
                </pre>
                {sections.length === 0 && (
                    <p className="mt-4 text-orange-500 italic">
                        Drizzle funciona perfectamente, pero la tabla está vacía.
                    </p>
                )}
            </div>
        )
    } catch (error: any) {
        return (
            <div className="p-10 text-red-500">
                <h1 className="text-2xl font-bold mb-4">Error con Drizzle: ❌</h1>
                <p>{error.message}</p>
            </div>
        )
    }
}
