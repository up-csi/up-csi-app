<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { uuid } from '$lib/shared';

    const { data } = $props();
    const { answers, questions } = data;

    type CommitteeProgress = {
        name: string;
        progress: string;
        color: string | undefined;
    };

    type SigsheetRow = {
        member_id: number;
        members?: { member_committee: string }; // not an array anymore
    };

    // const totalByCommittee: Record<string, number> = {};

    const committeeColors: Record<string, string> = {
        Executive: 'bg-cyan-400',
        'Membership & Internals': 'bg-pink-400',
        Service: 'bg-yellow-400',
        Innovation: 'bg-orange-400',
        Engineering: 'bg-red-500',
        'External Relations': 'bg-blue-500',
        'Branding & Creatives': 'bg-green-500',
    };

    let signatureSheet: CommitteeProgress[] = $state([]);
    let quizProgress = $state('');  // default before load


    function calculatePercentage(progress: string) {
        const [num, denom] = progress.split('/').map(Number);
        if (num && denom) return (num / denom) * 100;
        return 0;
    }

    
    const answeredCount = (answers ?? []).filter(
        (row) =>
        (row.answer_text && row.answer_text.trim().toUpperCase() !== 'EMPTY') ||
        row.option_id !== null
    ).length;

    const totalQuestions = questions?.length; // fetch this once in layout
    quizProgress = `${answeredCount}/${totalQuestions}`;
    
    onMount(async () => {
        const applicantId = $uuid;



        // supposedly we should fetch the user ID like this:
        /*
		const {
		data: { user }
	} = await supabase.auth.getUser();

	const applicantId = user?.id;
	*/

        // 1. Get sigsheet rows
        const supabase_sig = await supabase
            .from('sigsheet')
            .select('member_id, members:member_id (member_committee)')
            .eq('applicant_id', applicantId);

        const sig_error = supabase_sig.error;

        if (sig_error) {
            // console.error('Error fetching sigsheet:', sig_error.message);
            return;
        }

        const sig_data = supabase_sig.data;

        // 2. Count how many signatures per committee
        const committeeCounts: Record<string, number> = {};
        (sig_data as unknown as SigsheetRow[]).forEach(row => {
            const committee = row.members?.member_committee;
            if (!committee) return;
            committeeCounts[committee] = (committeeCounts[committee] || 0) + 1;
        });

        // 3. Get total members per committee
        const supabaseMembers = await supabase.from('members').select('member_committee');

        const memberError = supabaseMembers.error;
        // { data: memberData, error: memberError }

        if (memberError) {
            // console.error('Error fetching members:', memberError.message);
            return;
        }

        const memberData = supabaseMembers.data;

        const totalByCommittee: Record<string, number> = {
            Executive: 0,
            'Membership & Internals': 0,
            Service: 0,
            Innovation: 0,
            Engineering: 0,
            'External Relations': 0,
            'Branding & Creatives': 0,
        };
        memberData.forEach((row: { member_committee: string }) => {
            const committee = row.member_committee;
            totalByCommittee[committee] = (totalByCommittee[committee] || 0) + 1;
        });

        // 4. Build progress array
        signatureSheet = Object.entries(totalByCommittee).map(([name, total]) => {
            const count = committeeCounts[name] || 0;
            return {
                name,
                progress: `${count}/${total}`,
                color: committeeColors[name],
            };
        });
    });

    import logo from '$lib/icons/upcsi.svg';

    // take note month starts at 0
    // planned duration of consti quiz is from Oct 27 (12 AM) to Nov 1 (11:59 PM)
    const quizRawStart = new Date(2025, 9, 27, 0, 0, 0);
    const quizRawEnd = new Date(2025, 10, 1, 23, 59, 59);
    if (quizRawEnd.getTime() <= quizRawStart.getTime()) {
        throw new Error('Consti quiz end time is on or before start time');
    }

    let daysLeft = 0;
    let hoursLeft = 0;
    let quizClosingString = $state('');

    function updateTimeLeft() {
        const now = new Date();

        const timeLeft = quizRawEnd.getTime() - now.getTime();

        daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (now.getTime() - quizRawStart.getTime() < 0) {
            quizClosingString = `The quiz will open on ${quizRawStart.toLocaleDateString('en-us', { month: 'long' })} ${quizRawStart.getDate()}, ${quizRawStart.getFullYear()} at ${quizRawStart.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' })}.`;
        } else if (timeLeft < 0) {
            quizClosingString = 'The quiz has closed.';
        } else if (daysLeft < 1 && hoursLeft < 1) {
            quizClosingString = `The quiz will close at ${quizRawEnd.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' })}.`;
        } else {
            const daysString = `${daysLeft}${daysLeft === 1 ? ' day' : ' days'}`;
            const hoursString = `${hoursLeft}${hoursLeft === 1 ? ' hour' : ' hours'}`;
            const hasAnd = daysLeft > 0 && hoursLeft > 0;

            quizClosingString = `The quiz will close in ${daysLeft <= 0 ? '' : daysString}${hasAnd ? ' and ' : ''}${hoursLeft <= 0 ? '' : hoursString}.`;
        }
    }

    updateTimeLeft();
    setInterval(updateTimeLeft, 1000);
</script>

{#if data.session}
    <div class="font-inter h-screen flex-1 flex-row bg-[#161619] px-4 py-6 sm:px-6 lg:px-10">
        <h1 class="text-csi-white mb-2 text-center text-4xl font-bold lg:ml-12 lg:text-left">
            Hello, {data.user?.email?.split('@')[0]}!
        </h1>
        <h2 class="text-csi-white text-center text-2xl font-bold lg:ml-12 lg:text-left">Your Dashboard</h2>

        <main class="mt-6 flex flex-col lg:flex-row lg:justify-evenly">
            <div class="bg-csi-neutral-900 mb-8 flex flex-col gap-y-2.5 rounded-2xl p-6 lg:w-7/15">
                <h2 class="text-csi-blue text-3xl font-bold">Signature Sheet</h2>

                {#each signatureSheet as section}
                    <div>
                        <div class="flex justify-between">
                            <h3 class="text-csi-white">{section.name}</h3>
                            <p class="text-csi-white">{section.progress}</p>
                        </div>
                        <div class="mt-1 h-6 w-full overflow-hidden rounded-full bg-gray-700">
                            <div
                                class="{section.color} h-full"
                                style="width: {calculatePercentage(section.progress)}%"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>

            <div class="bg-csi-neutral-900 mb-8 flex flex-col gap-y-4 rounded-2xl p-6 lg:w-7/15">
                <h2 class="text-csi-blue text-3xl font-bold">Constitution Quiz</h2>
                <div class="flex justify-between">
                    <h3 class="text-csi-white text-lg font-bold">Progress</h3>
                    <p class="text-csi-white">{quizProgress}</p>
                </div>

                <div class="h-6 w-full overflow-hidden rounded-full bg-gray-700">
                    <div class="h-full bg-cyan-400" style="width: {calculatePercentage(quizProgress)}%"></div>
                </div>
                <p class="text-csi-white">{quizClosingString}</p>
                <div class="text-csi-white">
                    <p class="pb-2 text-lg font-bold">Constitution Quiz Mechanics</p>
                    <ul class="pr-0 pl-5 md:pl-10" style="list-style-type:circle;">
                        <li class="py-1">The constitution quiz is a requirement for all CSI Applicants</li>
                        <li class="py-1">
                            This quiz is open notes and you may view a copy of the constitution <a
                                class="text-csi-blue hover:underline hover:duration-300 hover:ease-in-out"
                                href="https://drive.google.com/file/d/1JtbGcts8YKyJsm20wgJh3I7Umwh0VwAz/view?usp=sharing"
                                target="_blank">here</a
                            >.
                        </li>
                        <li class="py-1">
                            Please keep the contents of the quiz confidential. You may not consult with other applicants
                            or members!
                        </li>
                        <li class="py-1">
                            The consti quiz is open from <b
                                >{quizRawStart.toLocaleDateString('en-us', { month: 'short' })}
                                {quizRawStart.getDate()} ({quizRawStart.toLocaleDateString('en-us', {
                                    weekday: 'short',
                                })}) to {quizRawEnd.toLocaleDateString('en-us', { month: 'short' })}
                                {quizRawEnd.getDate()} ({quizRawEnd.toLocaleDateString('en-us', {
                                    weekday: 'short',
                                })})</b
                            >. Your progress will be saved when you exit.
                        </li>
                    </ul>
                </div>

                {#if new Date().getTime() >= quizRawStart.getTime() && new Date().getTime() <= quizRawEnd.getTime()}
                    <a
                        href="./consti-quiz"
                        class="bg-csi-blue w-1/4 self-center rounded-3xl py-2 text-center font-bold text-[#161619]"
                        >Continue</a
                    >
                {/if}
            </div>
        </main>
    </div>
{:else}
    <div
        class="font-inter flex min-h-screen w-full flex-col items-center justify-center gap-4 border text-center dark:bg-[#161619]"
    >
        <main
            class="font-inter flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-6 lg:px-8 dark:bg-[#2f2f32]"
        >
            <div class="text-csi-blue mb-4 flex items-center justify-center gap-4">
                <img src={logo} class="w-[25px]" alt="CSI Logo" />
                <div class="font-inter flex flex-col text-left">
                    <span class="text-xs font-extralight">University of the Philippines</span>
                    <span class="mt-[-2px] text-xs font-semibold">Center for Student Innovations</span>
                </div>
            </div>

            <h1 class="dark:text-csi-white text-3xl font-extrabold">Welcome to the CSI App!</h1>

            <a href="/login" class="text-csi-blue text-base font-bold underline">Go to Login page</a>
        </main>
    </div>
{/if}