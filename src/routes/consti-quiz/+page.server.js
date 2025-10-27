export async function load({ locals }) {
    const { supabase } = locals;
    const { user } = await locals.safeGetSession();

    if (!user) {
        throw new Error('Failed to load user');
    }

    const [submission, availability] = await Promise.all([
        supabase.from('constiquiz-submissions').select('submission_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('constiquiz-availability').select('start, end').single(),
    ]);

    if (submission.error) {
        console.error(submission.error);
    }

    if (availability.error) {
        console.error(availability.error);
    }

    let isOpen = false;
    const hasSubmitted = Boolean(submission.data);

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
