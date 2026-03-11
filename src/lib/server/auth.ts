import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export type AppRole = 'applicant' | 'admin' | 'withdrawn' | 'inactive';

/**
 * Requires authenticated user. Throws 401 if not logged in.
 */
export function requireAuth(event: RequestEvent) {
    const { user, session } = event.locals;
    if (!session || !user) {
        throw error(401, 'Authentication required');
    }
    return { user, session };
}

/**
 * Requires a specific role. Throws 401 if not authenticated, 403 if wrong role.
 */
export function requireRole(event: RequestEvent, role: AppRole) {
    const { user, session } = requireAuth(event);
    if (event.locals.userRole !== role) {
        throw error(403, 'Insufficient permissions');
    }
    return { user, session };
}

/**
 * Check if current user is admin. Does not throw.
 */
export function isAdmin(event: RequestEvent): boolean {
    return event.locals.userRole === 'admin';
}
