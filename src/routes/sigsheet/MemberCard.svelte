<script lang="ts">
    const { filled, member } = $props();

    const memberimg = `/assets/members/${member.photo}.webp`;
</script>

<main
    class="font-[Inter, sans-serif] flex w-full flex-col gap-[0.01rem] rounded-2xl bg-[#262629] px-4 pb-4 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#333336] min-[834px]:w-[14vw]"
>
    <div class="-mx-4 mb-[1rem] self-center min-[834px]:w-[14vw]">
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
