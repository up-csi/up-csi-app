import type { PageServerLoad } from './$types';

import type { ISection } from './constiquiz-types.ts';

export async function load({ locals }) {
    const supabase = locals.supabase;

    const fetchSections = async (): ISection => {
        const { data, error } = await supabase.from('constiquiz-sections').select(`
	    section_id,
	    title,
	    description
	`);

        if (error) {
            // TODO: handle error
            console.error(error);
            throw error;
        }

        return data as ISection;
    };

    const fetchQuestions = async (): ISection => {
        const { data, error } = await supabase.from('constiquiz-questions').select(`
            title,
            point_value,
            type,
            section:constiquiz-sections (
                title
            ),
            options:constiquiz-options (
                option_id,
                title,
		value
            )
        `);

        if (error) {
            // TODO: handle error
            console.error(error);
            throw error;
        }

        // TODO: parse JSON properly
        return data as IQuestion;
    };

    const sections: ISections = await fetchSections();
    const questions: IQuestions = await fetchQuestions();

    return { sections, questions };
}
