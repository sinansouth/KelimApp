
export const logger = {
    log: (...args: any[]) => {
        // Safe check for development environment
        const isDev = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV);
        if (isDev) {
            console.log(...args);
        }
    },
    error: (...args: any[]) => {
        console.error(...args); // Always show errors
    }
};
