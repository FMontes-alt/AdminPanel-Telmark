import { createClient } from "@/lib/supabase/client";

export default async function TestPage() {
    const supabese = await createClient()

    // Intento de leer la tabla 'sections'

    const { data: sections, error } = await supabese.from('sections').select('*')

    if (error) {
        return <div className="p-10 text-red-500">Error: {error.message}</div>
    }

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Conexión con Supabase: ✅</h1>
            <pre className="bg-slate-100 p-4 rounded">
                {JSON.stringify(sections, null, 2)}
            </pre>
            {sections?.length === 0 && (
                <p className="mt-4 text-orange-500 italic">
                    La conexión funciona, pero la tabla 'sections' está vacía.
                    ¡Normal, aún no hemos metido datos!
                </p>
            )}
        </div>
    )
}