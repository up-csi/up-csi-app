import { dev } from '$app/environment';

function debug(...args: unknown[]) {
    if (dev) {
        console.log('[DEBUG]', ...args);
    }
}

function warn(...args: unknown[]) {
    if (dev) {
        console.warn('[WARN]', ...args);
    }
}

function error(...args: unknown[]) {
    console.error(...args);
}

export const logger = { debug, warn, error };
