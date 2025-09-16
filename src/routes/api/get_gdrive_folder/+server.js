import { PUBLIC_GOOGLE_PRIVATE_KEY, PUBLIC_GOOGLE_SERVICE_EMAIL } from '$env/static/public';
import { gdrive_root_folder } from '$lib/shared';
import { google } from 'googleapis';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
    try {
        const { uuid, username } = await request.json();

        // Ensure uuid is not empty
        if (uuid === '' || uuid === null) {
            console.error('Validation Error: $uuid is empty: ');
            return new Response(JSON.stringify({ error: 'UUID is empty.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (username === '' || username === null) {
            console.error('Validation Error: $username is empty: ');
            return new Response(JSON.stringify({ error: 'Username is empty.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Authenticate with Google Drive API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: PUBLIC_GOOGLE_SERVICE_EMAIL,
                private_key: PUBLIC_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const drive = google.drive({ version: 'v3', auth });

        // Check if applicant already has a gdrive_folder
        try {
            const { data, error } = await supabase
                .from('pic-folders')
                .select('gdrive_folder')
                .eq('applicant_uuid', uuid)
                .single();

            // Error PGRST116: row not found; So throw unexpected error
            if (error && error.code !== 'PGRST116') {
                console.error('Error reading from Supabase: ', error);
                throw new Error(error.message);
            }

            // If applicant has folder, return it
            if (data) {
                return new Response(
                    JSON.stringify({
                        message: 'Applicant does have folder',
                        folder_id: data.gdrive_folder,
                    }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    },
                );
            }
        } catch (supabaseError) {
            console.error('Error reading from Supabase:', supabaseError);
            return new Response(JSON.stringify({ error: 'Error reading from Supabase' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // No folder exists, so create a new one in Google Drive
        const fileMetadata = {
            name: `${username}`,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [gdrive_root_folder],
        };

        let folder_id = null;
        try {
            const gdrive_folder = await drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            folder_id = gdrive_folder.data.id;
        } catch (driveError) {
            console.error('Error creating new folder in Google Drive:', {
                message: driveError instanceof Error ? driveError.message : 'Unknown error',
                errors:
                    driveError instanceof Error && 'errors' in driveError
                        ? driveError.errors
                        : 'No additional error details',
                stack: driveError instanceof Error ? driveError.stack : 'No stack trace available',
            });
        }

        try {
            const { data, error } = await supabase
                .from('pic-folders')
                .insert({
                    applicant_uuid: uuid,
                    gdrive_folder: folder_id,
                })
                .select(); // makes Supabase return inserted rows

            if (error) {
                console.error('Error inserting folder into Supabase:', error);
                throw new Error(error.message);
            }

            return new Response(
                JSON.stringify({
                    message: 'Folder successfully inserted into Supabase',
                    folder_id: data[0].gdrive_folder,
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        } catch (supabaseError) {
            console.error('Error inserting to Supabase:', supabaseError);
            return new Response(JSON.stringify({ error: 'Error inserting into Supabase' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (err) {
        console.error('Unexpected Error: ', err);
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
