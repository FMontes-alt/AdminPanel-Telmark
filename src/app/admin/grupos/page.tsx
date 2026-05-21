import { getGroups } from "@/actions/groups"
import { getAgents } from "@/actions/users"
import { getHierarchy } from "@/actions/permissions"
import { GruposClient } from "./GruposClient"

export default async function GroupsPage() {
    const [groupsData, usersData, hierarchyData] = await Promise.all([
        getGroups(),
        getAgents(),
        getHierarchy()
    ])

    return (
        <GruposClient 
            initialGroups={groupsData}
            initialUsers={usersData}
            initialHierarchy={hierarchyData}
        />
    )
}
