import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    login: async ({ locals: { supabase }, url }) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${url.origin}/login/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            redirect(303, `login/error?code=oauth_failed`);
        }

        if (data.url) {
            redirect(303, data.url);
        }
    },
};
