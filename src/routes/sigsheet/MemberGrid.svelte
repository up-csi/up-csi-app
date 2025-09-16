<script lang="ts">
    import { fade } from 'svelte/transition';

    import { type mem, members } from './members';

    import MemberCard from './MemberCard.svelte';
    import Modal from './Modal.svelte';
    import { filledSigsheet } from '$lib/shared';

    const categories = ['Exec', 'M&I', 'Service', 'Innov', 'Engg', 'Exte', 'B&C'];

    const categoryColors: Record<string, string> = {
        Exec: 'var(--color-csi-blue)',
        'M&I': 'var(--color-mni-pink)',
        Service: 'var(--color-service-yellow)',
        Innov: 'var(--color-innov-orange)',
        Engg: 'var(--color-engg-blue)',
        Exte: 'var(--color-exte-blue)',
        'B&C': 'var(--color-bnc-green)',
    };

    const categoryHeaders: Record<string, string> = {
        Exec: 'Executive Committee',
        'M&I': 'Membership & Internals Committee',
        Service: 'Service Committee',
        Innov: 'Innovation Committee',
        Engg: 'Engineering Committee',
        Exte: 'External Relations Committee',
        'B&C': 'Branding & Creatives Committee',
    };

    let activeCategory = $state('Exec');
    let selectedMember = $state(members[0]);
    let showModal = $state(false);

    function openModal(member: mem) {
        if (!$filledSigsheet.has(member.member_id)) showModal = true;
        selectedMember = member;
    }

    function closeModal() {
        showModal = false;
    }
</script>

<div
    class="mx-[1.5vw] mt-6 items-start justify-between pb-4 min-[320px]:mx-4 min-[360px]:mx-5 min-[375px]:mx-[2.5vw] min-[375px]:mt-8 min-[375px]:pb-[1.5rem] min-[390px]:mx-[3vw] min-[390px]:mt-12"
    id="content"
>
    <h1
        class="text-csi-white mb-3 w-full text-xl font-bold min-[320px]:text-3xl min-[375px]:mb-4 min-[390px]:mb-[1.5rem] min-[640px]:text-4xl min-[1024px]:text-5xl"
    >
        {categoryHeaders[activeCategory]}
    </h1>

    <div class="flex flex-col-reverse gap-3 min-[375px]:gap-4 min-[390px]:gap-6 min-[834px]:flex-row">
        <div
            class="grid w-full grid-cols-2 gap-1.5 min-[375px]:gap-3 min-[390px]:gap-4 min-[480px]:grid-cols-4 min-[834px]:flex-1 min-[834px]:grid-cols-4 min-[834px]:gap-4 min-[1280px]:grid-cols-4"
        >
            {#each members.filter(member => member.category === activeCategory) as member (member.name)}
                <div in:fade={{ duration: 1300 }}>
                    <button onclick={() => openModal(member)} class="w-full cursor-pointer">
                        <MemberCard filled={$filledSigsheet.has(member.member_id)} {member} />
                    </button>
                </div>
            {/each}
        </div>

        <div
            class="flex flex-row flex-wrap justify-start gap-1 min-[375px]:gap-1.5 min-[390px]:gap-2 min-[834px]:ml-8 min-[834px]:flex-col min-[834px]:items-start min-[834px]:gap-4"
        >
            {#each categories as category}
                <button
                    class="border-csi-black text-csi-white bg-csi-grey flex w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-[#2C2C2E] px-[0.8rem] py-2 text-sm font-bold opacity-80 transition-colors duration-300 min-[390px]:gap-2 min-[390px]:px-[0.7rem] min-[390px]:py-1.5 min-[390px]:text-sm min-[640px]:px-[0.9rem] min-[640px]:py-2 min-[640px]:text-base"
                    class:opacity-100={activeCategory === category}
                    class:bg-transparent={activeCategory === category}
                    style:border-color={activeCategory === category ? categoryColors[category] : '#2C2C2E'}
                    onclick={() => (activeCategory = category)}
                >
                    <span
                        class="bg-mni-pink aspect-square w-[1.5rem] flex-shrink-0 rounded-full min-[390px]:w-[1.5rem]"
                        style:background-color={categoryColors[category]}
                    ></span>
                    <span class="flex items-center">{category}</span>
                </button>
            {/each}
        </div>
    </div>
    {#if showModal}
        <div class="flex-center fixed inset-0 justify-center bg-black/50">
            <Modal
                member_id={selectedMember?.member_id}
                name={selectedMember?.name}
                role={selectedMember?.role}
                {closeModal}
                {activeCategory}
            ></Modal>
        </div>
    {/if}
</div>
