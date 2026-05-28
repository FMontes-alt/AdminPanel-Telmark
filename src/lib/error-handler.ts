export function formatError(error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string, detail?: string, message?: string };
        if (dbError.code === '23505') {
            return { message: "Ya existe un registro con esos datos (Violación de unicidad)." };
        }
        if (dbError.code === '23503') {
            return { message: "No se puede completar la operación porque hay registros que dependen de este." };
        }
    }

    if (error instanceof Error) {
        return { message: error.message };
    }
    if (typeof error === "string") {
        return { message: error };
    }
    return { message: "Ha ocurrido un error inesperado." };
}
