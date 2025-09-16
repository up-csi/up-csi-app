import type { Answer, ISection, Question } from './consti-quiz/constiquiz-types.ts';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';

export async function load({ data, depends, fetch }) {
    depends('supabase:auth');

    const supabase = isBrowser()
        ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
              global: {
                  fetch,
              },
          })
        : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
              global: {
                  fetch,
              },
              cookies: {
                  getAll() {
                      return data.cookies;
                  },
              },
          });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.error('Failed to fetch user.');
        return {
            session: session,
            supabase: supabase,
            user: user,
            username: '',
            filledSigsheet: new Set<number>([]),
            gdrive_folder_id: '',
        };
    }

    const uuid = user.id;

    const username = user.email?.split('@')[0] ?? '';

    // Fetch filledSigsheet
    let filledSigsheet: Set<number> = new Set();
    try {
        const { data: sigRows, error: sigError } = await supabase
            .from('sigsheet')
            .select('member_id')
            .eq('applicant_id', uuid);

        if (sigError) throw sigError;

        filledSigsheet = new Set(sigRows?.map(row => row.member_id) ?? []);
    } catch (sigError) {
        console.error('Error fetching sigsheet: ', sigError);
    }

    // Fetch gdrive_folder_id
    let gdrive_folder_id: string = '';
    try {
        const response = await fetch('/api/get_gdrive_folder', {
            method: 'POST',
            body: JSON.stringify({
                uuid: uuid,
                username: username,
            }),
        });

        if (!response.ok) {
            const gDriveError = await response.json().catch(() => ({}));
            console.error('Error fetching gdrive folder:', gDriveError);
        } else {
            const folderData = await response.json();
            gdrive_folder_id = folderData.folder_id ?? '';
        }
    } catch (gDriveError) {
        console.error('Unexpected error fetching gdrive folder:', gDriveError);
    }

    // Functions for fetching constiquiz
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
                section:"constiquiz-sections"!inner (
                    section_id,
                    title,
                    points
                ),
                options:"constiquiz-options" (
                    option_id,
                    title
                )
            `);

        if (error || !data) {
            console.error(error);
            throw error;
        }

        // @ts-expect-error - no idea how to fix lint of this
        return data ?? [];
    };

    const fetchAnswers = async (): Promise<Answer[]> => {
        const { data, error } = await supabase
            .from('constiquiz-answers')
            .select(
                `
            user_id,
            question_id,
            option_id,
            answer_text
        `,
            )
            .eq('user_id', uuid);

        if (error) {
            console.error(error);
            throw error;
        }

        return data ?? [];
    };

    // fetch in parallel for faster results
    const [sections, questions, answers] = await Promise.all([fetchSections(), fetchQuestions(), fetchAnswers()]);

    return { session, supabase, user, uuid, username, filledSigsheet, gdrive_folder_id, sections, questions, answers };
}
