import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types.ts'; // import generated types
import type { AppRole } from '$lib/server/auth';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            supabase: SupabaseClient<Database>;
            safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
            session: Session | null;
            user: User | null;
            userRole: AppRole | null;
        }
        interface PageData {
            session: Session | null;
            userRole: AppRole | null;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
