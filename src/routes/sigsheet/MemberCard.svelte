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
           flex w-full h-full flex-col gap-[0.01rem] px-4 pb-4 min-[834px]:w-[14vw]
           border-5 border-l-stardew-border-light border-b-stardew-border-light border-t-stardew-border-shadow border-r-stardew-border-shadow
           text-center overflow-hidden
           transition-all duration-300 ease-in-out 
           hover:scale-105 hover:bg-[#333336]"
>
    <div class="-mx-4 mb-3 flex justify-center items-center self-center min-[834px]:w-[14vw]">
        <img
            src={memberimg}
            class="aspect-square w-full object-cover"
            class:grayscale={!filled}
            alt={member.name}
        />
    </div>

    <div>
        <h2 class="text-csi-white text-left text-2xl">{member.member_name}</h2>
        <h3 class="text-csi-white text-left text-lg">{member.role}</h3>
    </div>
</main>
