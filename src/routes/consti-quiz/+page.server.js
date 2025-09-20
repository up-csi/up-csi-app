export async function load({ locals }) {
    const { supabase } = locals;
    const { user } = await locals.safeGetSession();

    if (!user) {
        throw new Error('Failed to load user');
    }

    const { data, error } = await supabase.from('constiquiz-submissions').select('*').eq('user_id', user.id);

    if (error) {
        console.error(error);
    }

    const hasSubmitted = data && data.length;

    const availability = await supabase.from('constiquiz-availability').select('start, end').single();

    if (availability.error) {
        console.error(error);
    }

    let isOpen = false;

    if (availability.data) {
        const today = new Date();
        const start = new Date(availability.data.start);
        const end = new Date(availability.data.end);

        if (start <= today && today <= end) {
            isOpen = true;
        }
    }

    return { hasSubmitted, isOpen };
}
