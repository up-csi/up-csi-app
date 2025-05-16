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

    const totalByCommittee: Record<string, number> = {};
    

	const committeeColors: Record<string, string> = {
		"Executive": "bg-cyan-400",
		"Membership & Internals": "bg-pink-400",
		"Service": "bg-yellow-400",
		"Innovation": "bg-orange-400",
		"Engineering": "bg-red-500",
		"External Relations": "bg-blue-500",
		"Branding & Creatives": "bg-green-500"
	};

	let signatureSheet: CommitteeProgress[] = [];
	const quizProgress = '28/40';

	function calculatePercentage(progress: string) {
		const [num, denom] = progress.split('/').map(Number);
		if (num && denom) return (num / denom) * 100;
		return 0;
	}

onMount(async () => {
	const applicantId = '10dd9dfb-91c7-4307-bc1f-d2df76833112';
	
	//supposedly we should fetch the user ID like this:
	/*
		const {
		data: { user }
	} = await supabase.auth.getUser();

	const applicantId = user?.id;
	*/ 

	// 1. Get sigsheet rows
	const { data, error } = await supabase
		.from('sigsheet')
		.select('member_id, members:member_id (member_committee)')
		.eq('applicant_id', applicantId);

	if (error) {
		console.error('Error fetching sigsheet:', error.message);
		return;
	}

	// 2. Count how many signatures per committee
	const committeeCounts: Record<string, number> = {};
	(data as unknown as SigsheetRow[]).forEach(row => {
		const committee = row.members?.member_committee;
		if (!committee) return;
		committeeCounts[committee] = (committeeCounts[committee] || 0) + 1;
	});

	// 3. Get total members per committee
	const { data: memberData, error: memberError } = await supabase
		.from('members')
		.select('member_committee');

	if (memberError) {
		console.error('Error fetching members:', memberError.message);
		return;
	}

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
			color: committeeColors[name]    
		};
	});
});

</script>




<div class="font-inter h-screen flex-1 flex-row bg-[#161619] p-6">
    <h1 class="text-csi-white flex w-100 text-5xl font-bold">Your Dashboard</h1>

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
            <p class="text-csi-white">The quiz will close in # days and # hours</p>
            <p class="text-csi-white">Constitution quiz mechanics</p>
            <a
                href="./consti-quiz"
                class="bg-csi-blue w-1/6 self-center rounded-3xl py-2 text-center font-bold text-[#161619]">Continue</a
            >
        </div>
    </main>
</div>
