<script lang="ts">
    import type { User } from '@supabase/supabase-js';
    // Alphabetical imports
    import CheckboxQuestion from './CheckboxQuestion.svelte';
    import LongTextQuestion from './LongTextQuestion.svelte';
    import RadioQuestion from './RadioQuestion.svelte';
    import Section from './Section.svelte';
    import SectionNav from './SectionNav.svelte';
    import ShortTextQuestion from './ShortTextQuestion.svelte';
    import { writable } from 'svelte/store';

    const { data } = $props();
    const { user, sections, questions } = data;

    // NOTE: set to `false` to disable quiz rendering
    const isOpen = true;

    // NOTE: for debugging purposes only, remove during production
    console.log('sections:', sections);
    // NOTE: for debugging purposes only, remove during production
    console.log('questions:', questions);

    // State variables for messages
    const submissionError = $state('');
    const submissionSuccess = $state('');

    // filter questions by sections
    const preambleQuestions = questions.filter(q => q.section.title == 'UP CSI Preamble');
    const mvpQuestions = questions.filter(q => q.section.title == 'Mission, Vision, and Purpose');
    const ecQuestions = questions.filter(q => q.section.title == 'Executive Board and Committee Members');
    const tfQuestions = questions.filter(q => q.section.title == 'True or False');
    const mcQuestions = questions.filter(q => q.section.title == 'Multiple Choice');
    const bonusQuestions = questions.filter(q => q.section.title == 'Bonus');

    // quiz state
    const preambleAnswers = writable<string[]>(Array(preambleQuestions.length).fill(''));
    const mvpAnswers = writable<string[]>(Array(mvpQuestions.length).fill(''));
    const ecAnswers = writable<string[]>(Array(ecQuestions.length).fill(''));
    const tfAnswers = writable<string[]>(Array(tfQuestions.length).fill(''));
    const mcAnswers = writable<string[]>(Array(mcQuestions.length).fill(''));
    const bonusAnswers = writable<string[]>(Array(bonusQuestions.length).fill(''));
</script>

<div class="flex h-screen bg-[#161619] text-[#F9FAFB]">
    {#if !isOpen}
        <p>Come again next time!</p>
    {:else}
        <!-- Right side container (flexbox column) -->
        <div class="flex flex-1 flex-col bg-[#161619]">
            <!-- Banner at top (full width) -->
            <div class="bg-[#161619] p-8 pb-4">
                <h1 class="text-5xl font-bold">Constitution Quiz</h1>
            </div>

            <!-- Content area -->
            <div class="flex flex-1 overflow-hidden">
                <!-- Main Content -->
                <main class="w-3/5 overflow-y-auto bg-[#161619] p-8 pt-4">
                    {#each sections as { section_id, title, description } (section_id)}
                        <Section id={section_id.toString()} {title} {description}>
                            {#each questions.filter(({ section }) => section.title === title) as { title, type, options }}
                                {#if type === 'long_text'}
                                    <LongTextQuestion {title} />
                                {:else if type === 'short_text'}
                                    <ShortTextQuestion {title} />
                                {:else if type === 'radio'}
                                    <RadioQuestion
                                        {title}
                                        items={options.map(({ option_id, title, value }) => ({
                                            id: option_id,
                                            value,
                                            label: title,
                                        }))}
                                    />
                                {:else if type === 'checkbox'}
                                    <CheckboxQuestion
                                        {title}
                                        items={options.map(({ option_id, title, value }) => ({
                                            id: option_id,
                                            value,
                                            label: title,
                                        }))}
                                    />
                                {:else}
                                    <p>{title}</p>
                                {/if}
                            {/each}
                        </Section>
                    {/each}
                </main>

                <!-- Quiz Navigation Sidebar -->
                <aside class="w-2/5 overflow-y-auto bg-[#161619] p-8 pt-4">
                    <div class="mb-4 text-3xl font-bold text-[#00C6D7]">Table of Contents</div>

                    <!-- Section dropdown -->
                    <div class="rounded-lg bg-[#262629] p-6">
                        <SectionNav {sections} />
                    </div>
                </aside>
            </div>
        </div>
    {/if}
</div>
