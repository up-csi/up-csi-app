import { dev } from '$app/environment';

function debug(...args: unknown[]) {
    if (dev) {
        // eslint-disable-next-line no-console
        console.log('[DEBUG]', ...args);
    }
}

function warn(...args: unknown[]) {
    if (dev) {
        // eslint-disable-next-line no-console
        console.warn('[WARN]', ...args);
    }
}

function error(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error(...args);
}

export const logger = { debug, warn, error };
