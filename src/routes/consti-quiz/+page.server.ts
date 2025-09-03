import type { ISection, Question } from './constiquiz-types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const { supabase } = locals;

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

    // fetch in parallel for faster results
    const [sections, questions] = await Promise.all([fetchSections(), fetchQuestions()])

    return { sections, questions };
}
