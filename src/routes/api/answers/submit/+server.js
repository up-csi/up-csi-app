import { json } from '@sveltejs/kit';

export async function POST({ locals }) {
    const { supabase } = locals;
    const { user } = await locals.safeGetSession();

    if (!user) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch saved answers
    const { data: savedAnswers, error: ansError } = await supabase
        .from('constiquiz-answers')
        .select('*')
        .eq('user_id', user.id);

    if (ansError) {
        return json({ error: ansError.message }, { status: 500 });
    }

    if (!savedAnswers || savedAnswers.length === 0) {
        return json({ message: 'No answers found' });
    }

    // Check if all questions have either option_id or answer_text
    // as non-null or non-empty
    const notAllAnswered = savedAnswers.some(a => !a.answer_text?.trim() && a.option_id === null);
    if (notAllAnswered) {
        return json({ message: 'Quiz not yet finished' });
    }

    // Fetch questions with point values
    const questionIds = savedAnswers.map(a => a.question_id);
    const { data: questions } = await supabase
        .from('constiquiz-questions')
        .select('question_id, point_value')
        .in('question_id', questionIds);

    // Fetch all options for the answers
    // const optionIds = savedAnswers.map(a => a.option_id).filter(Boolean);
    const { data: options } = await supabase.from('constiquiz-options').select('option_id, is_correct, question_id');

    // Prepare updates
    if (!questions || !options) {
        return json({ message: 'Failed checking answers' });
    }

    // Check user answer if correct
    const updates = savedAnswers.map(a => {
        const question = questions.find(q => q.question_id === a.question_id);
        let points = 0;
        let is_checked = false;

        // SPECIAL CASE: checkbox questions don't have option_id
        if (a.question_id === 5400) {
            const selected_choices = a.answer_text.split('-');

            for (const choice of selected_choices) {
                const option = options.find(o => o.option_id === parseInt(choice, 10));
                if (option && option.is_correct) {
                    points += 2;
                } else {
                    points -= 1;
                }
            }
            is_checked = true;
        } else if (a.option_id) {
            const option = options.find(o => o.option_id === a.option_id);
            if (option && option.is_correct) {
                points = question?.point_value ?? 0;
            }
            is_checked = true;
        }

        return {
            id: a.answer_id,
            points,
            is_checked,
        };
    });

    if (!updates || updates.length !== savedAnswers.length) {
        return json({ message: 'Error with updating answers' }, { status: 406 });
    }

    // Batch update answers
    for (const u of updates) {
        await supabase
            .from('constiquiz-answers')
            .update({ points: u.points, is_checked: u.is_checked })
            .eq('answer_id', u.id);
    }

    // check if we made a submission before
    // NOTE: this shouldn't happen much as submit button should not appear when user has submitted

    const { data, error } = await supabase.from('constiquiz-submissions').select('*').eq('user_id', user.id);
    if ((data && data.length > 0) || error) {
        return json({ message: 'User has submitted already' });
    }

    // assume that once we reach this, we have successfully updated the database
    // user can only submit once hence we must add them to the constiquiz_submissions
    await supabase.from('constiquiz-submissions').insert({
        user_id: user.id,
    });

    return json({ message: 'Answers successfully submitted!', submitted: true });
}
