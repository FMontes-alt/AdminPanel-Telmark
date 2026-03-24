import { AdminPageHeader } from "@/components/ui/admin-page-header"

export function DashboardHeader() {
    return (
        <AdminPageHeader
            category="Central"
            title={<>Panel de <span className="text-blue-600">Control</span></>}
            description="Gestiona tus campañas y contenidos en tiempo real."
        />
    )
}
