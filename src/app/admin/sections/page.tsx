import { getAllSectionsAction } from "@/actions/sections"
import { SectionsClient } from "./SectionsClient"

export default async function SectionsPage() {
    const sectionsData = await getAllSectionsAction()
    
    return (
        <SectionsClient initialSections={sectionsData || []} />
    )
}
