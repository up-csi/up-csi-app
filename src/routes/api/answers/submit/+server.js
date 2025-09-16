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
        .eq('user_id', user.id)

    if (ansError) {
        return json({ error: ansError.message }, { status: 500 });
    }

    if (!savedAnswers || savedAnswers.length === 0) {
        return json({ message: "No answers found" });
    }

    // Check if all questions have either option_id or answer_text
    // as non-null or non-empty
    const notAllAnswered = savedAnswers.reduce((hasNotAnswered, currAnswer) => hasNotAnswered || ((currAnswer.answer_text === null || currAnswer.answer_text === 'EMPTY') && currAnswer.option_id === null), false)
    console.log('not all ans:', notAllAnswered);
    if (notAllAnswered) {
        return json({ message: "Quiz not yet finished", updates: notAllAnswered });
    }

    // Fetch questions with point values
    const questionIds = savedAnswers.map(a => a.question_id);
    const { data: questions } = await supabase
        .from('constiquiz-questions')
        .select('question_id, point_value')
        .in('question_id', questionIds);

    // Fetch all options for the answers
    const optionIds = savedAnswers.map(a => a.option_id).filter(Boolean);
    const { data: options } = await supabase
        .from('constiquiz-options')
        .select('option_id, is_correct, question_id')
        .in('option_id', optionIds);

    // Prepare updates
    const updates = savedAnswers.map(a => {
        const question = questions.find(q => q.question_id === a.question_id);
        let points = 0;
        let is_checked = false;

        if (a.option_id) {
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
        return json({ message: "Error with updating answers" });
    }

    // Batch update answers
    for (const u of updates) {
        await supabase.from('constiquiz-answers').update({ points: u.points, is_checked: u.is_checked }).eq('answer_id', u.id);
    }

    return json({ message: "Answers checked", updates });
};
