<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

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
    const quizProgress = '28/40';

    function calculatePercentage(progress: string) {
        const [num, denom] = progress.split('/').map(Number);
        if (num && denom) return (num / denom) * 100;
        return 0;
    }

    onMount(async () => {
        const applicantId = '10dd9dfb-91c7-4307-bc1f-d2df76833112';

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

        const totalByCommittee: Record<string, number> = {};
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

    const { data } = $props();
    import logo from '$lib/icons/upcsi.svg';

    // take note month starts at 0
    // sample deadline is May 31, 6:30 PM
    const quizRawDeadline = new Date(2025, 4, 31, 18, 30, 0);
    const deadlineHour = quizRawDeadline.getHours();
    const deadlineMinutes = quizRawDeadline.getMinutes();
    const quizDeadline = quizRawDeadline.getTime();
    let daysLeft = 0;
    let hoursLeft = 0;
    let quizClosingString = '';

    function updateTimeLeft() {
        const now = new Date().getTime();
        // console.log(now);

        const timeLeft = quizDeadline - now;

        daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (timeLeft < 0) {
            quizClosingString = 'The quiz has closed.';
        } else if (daysLeft < 1 && hoursLeft < 1) {
            quizClosingString = `The quiz will close at ${deadlineHour % 12}:${(deadlineMinutes < 10 ? '0' : '') + deadlineMinutes} ${deadlineHour >= 12 ? 'PM' : 'AM'}.`;
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
    <div class="font-inter h-screen flex-1 flex-row bg-[#161619] p-6">
        <h1 class="text-csi-white mb-2 flex w-100 text-4xl font-bold">Hello, {data.user?.email?.split('@')[0]}!</h1>
        <h2 class="text-csi-white flex w-100 text-2xl font-bold">Your Dashboard</h2>

        <main class="mt-6 flex justify-evenly">
            <div class="bg-csi-neutral-900 flex w-3/7 flex-col gap-y-2.5 rounded-2xl p-6">
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

            <div class="bg-csi-neutral-900 flex w-3/7 flex-col gap-y-4 rounded-2xl p-6">
                <h2 class="text-csi-blue text-3xl font-bold">Constitution Quiz</h2>
                <div class="flex justify-between">
                    <h3 class="text-csi-white">Progress</h3>
                    <p class="text-csi-white">{quizProgress}</p>
                </div>

                <div class="mt-1 h-4 w-full overflow-hidden rounded-full bg-gray-700">
                    <div class="h-full bg-cyan-400" style="width: {calculatePercentage(quizProgress)}%"></div>
                </div>
                <p class="text-csi-white">{quizClosingString}</p>
                <p class="text-csi-white">Constitution quiz mechanics</p>
                <a
                    href="./consti-quiz"
                    class="bg-csi-blue w-1/4 self-center rounded-3xl py-2 text-center font-bold text-[#161619]"
                    >Continue</a
                >
            </div>
        </main>
    </div>
{:else}
    <div
        class="font-inter flex min-h-screen w-full flex-col items-center justify-center gap-4 border text-center dark:bg-[#161619]"
    >
        <main
            class="font-inter flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-6 md:px-8 dark:bg-[#2f2f32]"
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
