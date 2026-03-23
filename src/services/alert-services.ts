import { createAlert } from "@/actions/alerts"

export const AlertService = {
    // SECCIONES
    sectionCreated: (name: string, id: string) =>
        createAlert({
            type: "create",
            severity: "info",
            message: `Nueva sección creada: ${name}`,
            targetName: name,
            targetId: id
        }),

    sectionDeleted: (name: string, id: string) =>
        createAlert({
            type: "delete",
            severity: "critical",
            message: `Sección eliminada definitivamente: ${name}`,
            targetName: name,
            targetId: id
        }),

    sectionLocked: (name: string, id: string) =>
        createAlert({
            type: "lock",
            severity: "warning",
            message: `Bloqueo total activado en: ${name}`,
            targetName: name,
            targetId: id
        }),

    sectionUnlocked: (name: string, id: string) =>
        createAlert({
            type: "unlock",
            severity: "info",
            message: `Sección desbloqueada: ${name}`,
            targetName: name,
            targetId: id
        }),

    sectionErrorReported: (name: string, id: string) =>
        createAlert({
            type: "error",
            severity: "critical",
            message: `Incidencia reportada en: ${name}`,
            targetName: name,
            targetId: id
        }),

    sectionErrorFixed: (name: string, id: string) =>
        createAlert({
            type: "system",
            severity: "info",
            message: `Incidencia resuelta en: ${name}`,
            targetName: name,
            targetId: id
        })
}
