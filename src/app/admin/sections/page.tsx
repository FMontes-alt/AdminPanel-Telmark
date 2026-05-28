import { getAllSectionsAction } from "@/actions/sections"
import { SectionsClient } from "./SectionsClient"

export default async function SectionsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const sectionsData = await getAllSectionsAction()
    const isAdding = searchParams.action === 'new'
    
    return (
        <SectionsClient initialSections={sectionsData || []} initialIsAdding={isAdding} />
    )
}
