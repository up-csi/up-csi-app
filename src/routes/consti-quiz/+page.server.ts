import type { PageServerLoad } from './$types';

export async function load({ locals }) {
    const supabase = locals.supabase;

    // NOTE: put here what columns are needed
    const select_query = `
        title,
        point_value,
        type,
        section:constiquiz-sections (
            title
        ),
        options:constiquiz-options (
            title
        )
    `;

    const { data, error } = await supabase.from('constiquiz-questions').select(select_query);

    if (error) {
        console.error(error);
        throw error;
    }

    console.log(data);

    return { questions: data };
}
