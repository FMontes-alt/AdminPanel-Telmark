export function formatError(error: unknown) {
    if (error instanceof Error) {
        return { message: error.message };
    }
    if (typeof error === "string") {
        return { message: error };
    }
    return { message: "Ha ocurrido un error inesperado." };
}
