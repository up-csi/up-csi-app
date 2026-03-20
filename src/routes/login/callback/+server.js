import { logger } from '$lib/logger';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') ?? '/';

    if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
            logger.error('Code exchange failed:', exchangeError.message);
            throw redirect(303, `/login/error?code=oauth_failed`);
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            logger.error('Failed to get user:', userError?.message);
            throw redirect(303, '/login/error?code=no_user');
        }

        // Check ends with up mail
        if (!user.email?.endsWith('@up.edu.ph')) {
            await supabase.auth.signOut();
            throw redirect(303, `/login/error?code=domain_restricted`);
        }

        // Check if email is in whitelist
        const { data, error } = await supabase.from('whitelist').select('id').eq('email', user.email).single();

        if (error && error.code === 'PGRST116') {
            logger.error(error.message);
            logger.warn(`Attempted login with non-whitelisted email: ${user.email}`);
            await supabase.auth.signOut();
            throw redirect(303, `/login/error?code=non_csi`);
        }

        if (error || data === null) {
            logger.error('Database query error:', error);
            await supabase.auth.signOut();
            throw redirect(303, `/login/error?code=db_error`);
        }

        // Login Successful:
        const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/';
        throw redirect(303, safePath);
    }

    // return the user to an error page with instructions
    throw redirect(303, '/login/error?code=invalid_callback');
};
