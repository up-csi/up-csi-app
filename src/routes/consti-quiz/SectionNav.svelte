<script lang="ts">
    type Props = {
        sections: ISection[];
    };

    const { sections }: Props = $props();
</script>

<div class="rounded-lg bg-[#262629] p-6">
    <h2 class="mb-6 text-2xl font-bold text-white">Quiz Navigation</h2>
    {#each sections as { section_id, title, description }}
        <a
            href={`#${section_id}`}
            class="mb-2 block rounded p-4 text-lg text-[#00C6D7] transition-colors duration-200 hover:bg-[#2C2C2F]"
        >
            {title}
        </a>
    {/each}
</div>
