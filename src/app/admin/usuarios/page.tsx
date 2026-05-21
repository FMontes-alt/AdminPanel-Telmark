import { getAgents } from "@/actions/users"
import { getGroups } from "@/actions/groups"
import { getHierarchy } from "@/actions/permissions"
import { getAllSectionsAction } from "@/actions/sections"
import { UsuariosClient } from "./UsuariosClient"

export default async function AgentsPage() {
    const [agentsData, sectionsData, groupsData, hierarchyData] = await Promise.all([
        getAgents(),
        getAllSectionsAction(),
        getGroups(undefined, true),
        getHierarchy()
    ])

    return (
        <UsuariosClient 
            initialAgents={agentsData}
            initialSections={sectionsData}
            initialGroups={groupsData}
            initialHierarchy={hierarchyData}
        />
    )
}
