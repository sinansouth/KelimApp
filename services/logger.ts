export const logger = {
    log: (...args: any[]) => {
        // FIX: Access Vite environment variable via a type cast to 'any' to resolve TypeScript error.
        if ((import.meta as any).env.DEV) {
            console.log(...args);
        }
    },
    error: (...args: any[]) => {
        console.error(...args); // Error'lar hep göster
    }
};