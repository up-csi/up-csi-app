import type { ISection, Question } from './constiquiz-types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const { supabase } = locals;

    const { user } = await locals.safeGetSession();
    if (!user) return new Response('Unauthorized', { status: 401 });
    const uuid = user.id;

    const fetchSections = async (): Promise<ISection[]> => {
        const { data, error } = await supabase.from('constiquiz-sections').select(`
	    section_id,
	    title,
	    points
	`);

        if (error) {
            // TODO: handle error
            console.error(error);
            throw error;
        }

        return data ?? [];
    };

    const fetchQuestions = async (): Promise<Question[]> => {
        const { data, error } = await supabase.from('constiquiz-questions').select(`
            title,
            point_value,
            type,
            section:constiquiz-sections (
                title
            ),
            options:constiquiz-options (
                option_id,
                title
            )
        `);

        if (error) {
            // TODO: handle error
            console.error(error);
            throw error;
        }

        return data ?? [];
    };

    const fetchAnswers = async (): Promise<Answer[]> => {

        const { data, error } = await supabase.from('constiquiz-answers').select(`
            user_id,
            question_id,
            option_id,
            answer_text
        `).eq('user_id', uuid);

        if (error) {
            console.error(err);
            throw err;
        }

        return data ?? [];
}


    // fetch in parallel for faster results
    const [sections, questions, answers] = await Promise.all([fetchSections(), fetchQuestions(), fetchAnswers()]);

    return { sections, questions, answers };
}
