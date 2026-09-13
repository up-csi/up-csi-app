<script lang="ts">
    const { filled, member } = $props();

    // function getImage(imgname: string) {
    //     return new URL(`../../lib/assets/members/${imgname}.webp`, import.meta.url).href;
    // }

    // const memberimg = getImage(member.photo);
    const memberimg = $derived(`/assets/members/${member.photo}.webp`);
</script>

<main
    class="font-stardew-body
           border-l-stardew-border-light border-b-stardew-border-light border-t-stardew-border-shadow border-r-stardew-border-shadow hover:bg-innov-orange flex
           h-full w-full flex-col overflow-hidden border-5
           pb-4 text-center
           transition-all duration-300 ease-in-out
           hover:scale-105 min-[834px]:w-[14vw]"
>
    <div
        class="border-b-stardew-border-light -mx-4 flex items-center justify-center self-center border-b-4 min-[834px]:w-[14vw]"
    >
        <img
            src={memberimg}
            class="aspect-square w-full object-cover"
            class:grayscale={!filled}
            alt={member.name}
            onerror={event => {
                const target = event.target as HTMLImageElement;
                target.src = '/assets/members/LinoPlaceholder.webp';
            }}
        />
    </div>

    <div class="border-t-stardew-border-shadow w-full border-t-4 px-2 pt-3">
        <h2 class="text-stardew-font-color text-left text-2xl">{member.member_name}</h2>
        <h3 class="text-stardew-font-color text-left text-lg">{member.role}</h3>
    </div>
</main>
