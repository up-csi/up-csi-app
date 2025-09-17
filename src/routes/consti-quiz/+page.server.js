export async function load({ locals })  {
	const { supabase } = locals;
	const { user } = await locals.safeGetSession();

	const { data, error } = await supabase.from('constiquiz-submissions').select('*').eq('user_id', user.id);

	if (error) {
		console.error(error);
	}

	const hasSubmitted = data && data.length; 

	return { hasSubmitted }
};
