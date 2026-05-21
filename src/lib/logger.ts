export const log = {
    info: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
        }
    },
    error: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
        } else {
            // Aquí se enviaría a un servicio externo como Sentry/Datadog
            console.error(message, ...args);
        }
    }
}
