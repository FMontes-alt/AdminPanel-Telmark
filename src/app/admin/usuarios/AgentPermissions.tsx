import { Info } from "lucide-react"
import { PermissionSelector } from "../components/PermissionSelector"

interface AgentPermissionsProps {
    hierarchy: any[];
    permissionItems: any[];
    inheritedPermissions: any[];
    onChange: (items: any[]) => void;
}

export function AgentPermissions({ hierarchy, permissionItems, inheritedPermissions, onChange }: AgentPermissionsProps) {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                <Info className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    Los permisos aquí son <strong>adicionales y específicos</strong> para este usuario. También heredará los permisos de los grupos a los que pertenezca.
                </p>
            </div>
            <PermissionSelector
                hierarchy={hierarchy}
                selectedItems={permissionItems}
                inheritedPermissions={inheritedPermissions}
                onChange={onChange}
            />
        </div>
    )
}
