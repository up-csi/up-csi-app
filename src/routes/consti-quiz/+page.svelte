<script lang="ts">
    // Alphabetical imports
    import type { ISection, Question } from './constiquiz-types';
    import CheckboxQuestion from './CheckboxQuestion.svelte';
    import LongTextQuestion from './LongTextQuestion.svelte';
    import QuizClosedPage from './QuizClosedPage.svelte';
    import QuizSummaryPage from './QuizSummaryPage.svelte';
    import RadioQuestion from './RadioQuestion.svelte';
    import SaveButton from './SaveButton.svelte';
    import Section from './Section.svelte';
    import SectionNav from './SectionNav.svelte';
    import ShortTextQuestion from './ShortTextQuestion.svelte';

    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    const { data } = $props();
    const { user, sections, questions, answers, hasSubmitted, isOpen } = data;

    // NOTE: do we even this need this part
    const questionIdToPoints = {
        '1100': 1,
        '1200': 1,
        '1300': 1,
        '1400': 1,
        '1500': 1,

        '2100': 6,
        '2200': 6,
        '2300': 4,
        '2400': 1,

        '3100': 14,
        '3200': 12,
        '3300': 2,

        '4100': 2,
        '4200': 2,
        '4300': 2,
        '4400': 2,
        '4500': 2,
        '4600': 2,
        '4700': 2,
        '4800': 2,
        '4900': 2,

        '5100': 2,
        '5200': 2,
        '5300': 2,
        '5400': 4,
        '5500': 2,

        '6100': 2,
        '6200': 2,
        '6300': 2,
        '6400': 2,
        '6500': 2,

        '7100': 1,
        '7200': 1,
        '7300': 2,
        '7400': 1,
        '7500': 2,
        '7600': 1,
    };

    // points left to be scored
    const uncheckedPoints = answers!
        .filter(a => !a.is_checked)
        // @ts-expect-error - nakakatamad
        .reduce((total, a) => total + questionIdToPoints[a.question_id], 0);

    // points of correct answers that are already checked
    const checkedPoints = answers!.filter(a => a.is_checked).reduce((total, a) => total + a.points, 0);

    // subtract 10 from bonus
    const totalPoints = 88;

    // NOTE: for debugging purposes only, remove during production
    console.log('sections:', sections);
    // NOTE: for debugging purposes only, remove during production
    console.log('questions:', questions);

    // filter questions by sections
    const preambleQuestions = questions!.filter((q: Question) => q.section.title === 'UP CSI Preamble');
    const mvpQuestions = questions!.filter((q: Question) => q.section.title === 'Mission, Vision, and Purpose');
    const ecQuestions = questions!.filter((q: Question) => q.section.title === 'Executive Board and Committee Members');
    const tfQuestions = questions!.filter((q: Question) => q.section.title === 'True or False');
    const mcQuestions = questions!.filter((q: Question) => q.section.title === 'Multiple Choice');
    const bonusQuestions = questions!.filter((q: Question) => q.section.title === 'Bonus');
    const brandBookQuestions = questions!.filter((q: Question) => q.section.title === 'Brandbook');

    // quiz state
    const preambleAnswers = $state(Array(preambleQuestions.length).fill(''));
    const mvpAnswers = $state(Array(mvpQuestions.length).fill(''));
    const ecAnswers = $state(Array(ecQuestions.length).fill(''));
    const tfAnswers = $state(Array(tfQuestions.length).fill(''));
    const mcAnswers = $state(Array(mcQuestions.length).fill(''));
    const bonusAnswers = $state(Array(bonusQuestions.length).fill(''));
    const brandBookAnswers = $state(Array(brandBookQuestions.length).fill(''));

    // mapping from section id to quiz states
    const sectionToAnswers: Record<string, string[]> = $state({
        '1000': preambleAnswers,
        '2000': mvpAnswers,
        '3000': ecAnswers,
        '4000': tfAnswers,
        '5000': mcAnswers,
        '6000': bonusAnswers,
        '7000': brandBookAnswers,
    });

    // Rearrange sections such that bonus goes last
    // NOTE: maybe it's better to refactor how bonus is stored in db so it stays last all the time
    // this is kinda ugly
    const rearrangedSections: ISection[] = sections!
        .filter((s: ISection) => s.title !== 'Bonus')
        .concat(...sections!.filter((s: ISection) => s.title === 'Bonus'));

    function saveProgress(quiz: Record<string, string[]>) {
        if (browser) {
            localStorage.setItem('quiz-progress', JSON.stringify(quiz));
        }
    }

    function loadProgress() {
        if (browser) {
            const progress = localStorage.getItem('quiz-progress');
            if (progress) {
                Object.assign(sectionToAnswers, JSON.parse(progress));
            }
        }
    }

    async function submitAnswersToServer() {
        try {
            const res = await fetch('/api/answers/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to submit answers: ${res.statusText}`);
            }

            const json = await res.json();

            // console.log(json.message);
            // console.log(json.updates);

            return json;
        } catch (error) {
            console.error(error);
        }
    }

    async function saveAnswersToServer() {
        try {
            const answersToAnswerObject = Object.entries(sectionToAnswers).flatMap(([sectionId, answerArray]) =>
                answerArray.map((answer, index) => {
                    const optionId = !isNaN(Number(answer)) && Number(answer) >= 1000 ? Number(answer) : null;
                    const answerText = optionId === null ? answer : null;
                    const questionId = Number(`${sectionId.slice(0, 1)}${index + 1}${sectionId.slice(2, 4)}`);

                    return {
                        user_id: user!.id,
                        question_id: questionId,
                        option_id: optionId,
                        answer_text: answerText,
                    };
                }),
            );

            const res = await fetch('/api/answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: answersToAnswerObject,
                }),
            });

            if (!res.ok) {
                throw new Error(`Failed to save answers: ${res.statusText}`);
            }

            return await res.json();
        } catch (err) {
            console.error(err);
        }
    }

    onMount(() => {
        loadProgress();

        if (answers) {
            for (const answer of answers) {
                const qidStr = answer.question_id.toString();
                const section_id = `${qidStr[0]}000`;
                const ans_idx = Number(qidStr[1]) - 1;

                if (!sectionToAnswers[section_id]) continue;

                if (answer.option_id) {
                    // @ts-expect-error - TODO: fix this
                    sectionToAnswers[section_id][ans_idx] = answer.option_id;
                } else if (answer.answer_text) {
                    sectionToAnswers[section_id][ans_idx] = answer.answer_text;
                }
            }
        }
    });

    $effect(() => {
        saveProgress(sectionToAnswers);
    });
</script>

<div class="my-12 flex h-screen bg-[#161619] text-[#F9FAFB]">
    {#if hasSubmitted}
        <!-- Content area -->
        <div class="font-inter h-screen flex-row bg-[#161619] px-4 py-6 sm:px-6 lg:px-10">
            <!-- Main Content -->
            <main class="mt-6 flex flex-row justify-evenly">
                <QuizSummaryPage {checkedPoints} {uncheckedPoints} {totalPoints} />
            </main>
        </div>
    {:else if !isOpen}
        <!-- Content area -->
        <div class="font-inter h-screen flex-1 flex-row bg-[#161619] px-4 py-6 sm:px-6 lg:px-10">
            <!-- Main Content -->
            <main class="mt-6 flex flex-col lg:flex-row lg:justify-evenly">
                <QuizClosedPage />
            </main>
        </div>
    {:else}
        <!-- Right side container (flexbox column) -->
        <div class="flex flex-1 flex-col bg-[#161619]">
            <!-- Banner at top (full width) -->
            <div class="bg-[#161619] p-8 pb-4">
                <h1 class="text-3xl font-bold md:text-5xl">Constitution Quiz</h1>
            </div>

            <!-- Content area -->
            <div class="flex flex-1 flex-col overflow-hidden md:flex-row">
                <!-- Quiz Navigation Sidebar -->
                <aside
                    class="mb-2 h-2/5 overflow-x-auto bg-[#161619] p-4 pt-4 text-center md:h-full md:w-2/5 md:overflow-y-auto md:p-8 md:text-left"
                >
                    <div class="mb-4 text-xl font-bold text-[#00C6D7] md:text-3xl">Table of Contents</div>

                    <!-- Section dropdown -->
                    <div class="rounded-lg bg-[#262629] p-6">
                        <SectionNav sections={rearrangedSections!} />
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="h-3/5 w-full overflow-y-auto bg-[#161619] p-4 pt-4 md:h-full md:w-3/5 md:p-8">
                    {#each rearrangedSections! as { section_id, title, points } (section_id)}
                        <Section id={section_id.toString()} {title} {points}>
                            {#each questions!.filter(question => question.section.title === title) as question, i}
                                {#if question.type === 'long_text'}
                                    <LongTextQuestion
                                        title={question.title}
                                        bind:value={sectionToAnswers[section_id]![i]!}
                                    />
                                {:else if question.type === 'short_text'}
                                    <ShortTextQuestion
                                        title={question.title}
                                        bind:value={sectionToAnswers[section_id]![i]!}
                                    />
                                {:else if question.type === 'radio'}
                                    {#if question.section.title === 'Bonus'}
                                        <RadioQuestion
                                            title={question.title}
                                            bind:value={sectionToAnswers[section_id]![i]}
                                            items={question.options!.map(option => ({
                                                id: option.option_id,
                                                label: option.title,
                                            }))}
                                            other
                                        />
                                    {:else}
                                        <RadioQuestion
                                            title={question.title}
                                            bind:value={sectionToAnswers[section_id]![i]!}
                                            items={question.options!.map(option => ({
                                                id: option.option_id,
                                                label: option.title,
                                            }))}
                                        />
                                    {/if}
                                {:else if question.type === 'checkbox'}
                                    <CheckboxQuestion
                                        title={question.title}
                                        bind:value={sectionToAnswers[section_id]![i]!}
                                        items={question.options!.map(option => ({
                                            id: option.option_id,
                                            label: option.title,
                                        }))}
                                    />
                                {:else}
                                    <p>{title}</p>
                                {/if}
                            {/each}
                        </Section>
                    {/each}
                </main>

                <!-- Save Button -->
                <SaveButton saveAnswers={saveAnswersToServer} submitAnswers={submitAnswersToServer} />
            </div>
        </div>
    {/if}
</div>
