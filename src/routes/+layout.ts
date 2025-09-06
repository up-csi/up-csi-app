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
    console.log('Fetched uuid:', uuid);

    const username = user.email?.split('@')[0] ?? '';
    console.log('Fetched username:', username);

    // Fetch filledSigsheet
    console.log('Fetching sigsheet from Supabase with ID:', uuid);
    let filledSigsheet: Set<number> = new Set();
    try {
        const { data: sigRows, error: sigError } = await supabase
            .from('sigsheet')
            .select('member_id')
            .eq('applicant_id', uuid);

        if (sigError) throw sigError;

        filledSigsheet = new Set(sigRows?.map(row => row.member_id) ?? []);
        console.log(`Fetched filledSigsheet: sigsheet size ${filledSigsheet.size}`);
    } catch (sigError) {
        console.error('Error fetching sigsheet: ', sigError);
    }

    // Fetch gdrive_folder_id
    console.log('Fetching gdrive_folder_id for Applicant:', uuid);
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

    return { session, supabase, user, uuid, username, filledSigsheet, gdrive_folder_id };
}
