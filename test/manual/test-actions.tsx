import { getSections } from "@/actions/sections"
import { getSectionHierarchy } from "@/actions/hierarchy"

/**
 * Página temporal de verificación de Server Actions.
 * Accede a: http://localhost:3000/test-actions
 * ELIMINAR cuando se confirme que todo funciona.
 */
export default async function TestActionsPage() {
    // 1. Probar getSections()
    const allSections = await getSections()

    // 2. Probar getSectionHierarchy() con la primera sección que encontremos
    const firstSlug = allSections[0]?.slug
    const hierarchy = firstSlug ? await getSectionHierarchy(firstSlug) : null

    return (
        <div className="p-8 max-w-4xl mx-auto font-mono text-sm">
            <h1 className="text-2xl font-bold mb-6 font-sans">Test de Server Actions</h1>

            {/* TEST 1: getSections */}
            <section className="mb-8 bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-2 font-sans text-green-700">
                    getSections() — {allSections.length} resultado(s)
                </h2>
                <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(allSections, null, 2)}
                </pre>
            </section>

            {/* TEST 2: getSectionHierarchy */}
            <section className="mb-8 bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-2 font-sans text-blue-700">
                    getSectionHierarchy(&quot;{firstSlug ?? "N/A"}&quot;)
                </h2>
                {hierarchy ? (
                    <>
                        <p className="text-sm text-slate-600 mb-2 font-sans">
                            {hierarchy.categories.length} categorías,{" "}
                            {hierarchy.categories.reduce((acc, c) => acc + c.subcategories.length, 0)} subcategorías,{" "}
                            {hierarchy.categories.reduce((acc, c) => acc + c.subcategories.reduce((a, sc) => a + sc.items.length, 0), 0)} items
                        </p>
                        <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs max-h-[500px] overflow-y-auto">
                            {JSON.stringify(hierarchy, null, 2)}
                        </pre>
                    </>
                ) : (
                    <p className="text-red-500 font-sans">No se encontraron secciones. ¿Has ejecutado npm run seed?</p>
                )}
            </section>
        </div>
    )
}
