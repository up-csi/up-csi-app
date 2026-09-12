<script lang="ts">
    import type { ISection } from './constiquiz-types';

    type Props = {
        sections: ISection[];
    };

    let selectedSection: number = $state(-1);

    const { sections }: Props = $props();
</script>

<div class="border-6 border-stardew-border-dark bg-stardew-border-fill p-1">
    <div class="p-2 md:p-6 bg-linear-to-b from-stardew-bg-light to-stardew-bg-dark border-6 border-stardew-border-dark">
        <h2 class="mb-2 text-3xl font-stardew-body text-stardew-font-color md:mb-6">Quiz Navigation</h2>
        {#each sections as { section_id, title } (section_id)}
            <a
                href={`#${section_id}`}
                class="flex flex-row items-start gap-3 rounded p-4 text-left text-md md:text-lg font-stardew-body text-[#00C6D7] transition-colors duration-200 hover:bg-innov-orange"
                onclick={() => {selectedSection = section_id}}
            >
                <div class="mt-0.5 grid size-6 shrink-0 place-content-center border-2 border-stardew-border-dark {selectedSection === section_id ? "bg-[url('assets/stardew-checkbox-cross.svg')] bg-cover bg-center" : ""}">
                </div>
                <span>{title}</span>
            </a>
        {/each}
    </div>
</div>