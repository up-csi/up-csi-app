import { supabase } from '$lib/supabaseClient';

export async function GET({ url }) {
    console.log('Received GET request at /api/sigsheet');

    try {
        const applicant_id = url.searchParams.get('applicant_id');
        const member_id = url.searchParams.get('member_id');

        if (!applicant_id || !member_id) {
            return new Response(JSON.stringify({ error: 'Missing applicant_id or member_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('Fetching sigsheet data for applicant_id:', applicant_id, 'member_id:', member_id);

        const { data, error } = await supabase
            .from('sigsheet')
            .select('question, answer, image_url, member_name')
            .eq('applicant_id', applicant_id)
            .eq('member_id', member_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No data found
                return new Response(JSON.stringify({ error: 'No submission found for this member' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            console.error('Error fetching from Supabase:', error);
            return new Response(JSON.stringify({ error: 'Error fetching data' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('Data fetched successfully:', data);

        // Transform Google Drive URL to a more compatible format for image display
        let imageUrl = data.image_url;
        console.log('Original image URL:', imageUrl);
        if (imageUrl && imageUrl.includes('drive.google.com/uc?id=')) {
            // Use Google's image proxy service for better compatibility
            const fileId = imageUrl.split('uc?id=')[1];
            imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
            console.log('Transformed image URL:', imageUrl);
        }

        return new Response(
            JSON.stringify({
                question: data.question,
                answer: data.answer,
                image_url: imageUrl,
                member_name: data.member_name,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    } catch (err) {
        console.error('Unexpected error:', err);
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
