import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') ?? '/';

    if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
            console.error('Code exchange failed:', exchangeError.message);
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError?.message);
            throw redirect(303, '/login/error?code=no_user');
        }

        if (!user.email?.endsWith('@up.edu.ph')) {
            await supabase.auth.signOut();

            throw redirect(303, `/login/error?code=domain_restricted`);
        }

        // Whitelist CSI Members, placeholder code
        // const allowedEmails = [
        //     "cssacles@up.edu.ph",
        // ]

        // if(!allowedEmails.includes(user.email)){
        //     await supabase.auth.signOut();
        //     throw redirect(303, `/login/error?code=non_CSI`)
        // }

        throw redirect(303, `/${next.slice(1)}`);
    }

    // return the user to an error page with instructions
    throw redirect(303, '/login/error?code=invalid_callback');
};
