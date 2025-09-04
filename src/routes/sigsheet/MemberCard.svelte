<script lang="ts">
    const { filled, member } = $props();

    // function getImage(imgname: string) {
    //     return new URL(`../../lib/assets/members/${imgname}.webp`, import.meta.url).href;
    // }

    // const memberimg = getImage(member.photo);
    const memberimg = `/assets/members/${member.photo}.webp`
</script>

<main
    class="font-[Inter, sans-serif] flex w-[14vw] flex-col gap-[0.01rem] rounded-2xl bg-[#262629] px-4 pt-0 pb-4 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#333336]"
>
    <div class="mb-[1rem] w-[14vw] self-center">
        <img
            src={memberimg}
            class="aspect-square rounded-2xl object-cover"
            class:grayscale={!filled}
            alt={member.name}
        />
    </div>

    <div>
        <h2 class="text-csi-white text-left text-lg font-bold">{member.name}</h2>
        <h3 class="text-csi-white text-left text-sm">{member.role}</h3>
    </div>
</main>
