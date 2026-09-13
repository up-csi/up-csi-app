<script lang="ts">
    import type { ISection } from './constiquiz-types';

    type Props = {
        sections: ISection[];
    };

    let selectedSection: number = $state(-1);

    const { sections }: Props = $props();
</script>

<div class="border-stardew-border-dark bg-stardew-border-fill border-6 p-1">
    <div class="from-stardew-bg-light to-stardew-bg-dark border-stardew-border-dark border-6 bg-linear-to-b p-2 md:p-6">
        <h2 class="font-stardew-body text-stardew-font-color mb-2 text-3xl md:mb-6">Quiz Navigation</h2>
        {#each sections as { section_id, title } (section_id)}
            <a
                href={`#${section_id}`}
                class="text-md font-stardew-body hover:bg-innov-orange flex flex-row items-start gap-3 rounded p-4 text-left text-[#00C6D7] transition-colors duration-200 md:text-lg"
                onclick={() => {
                    selectedSection = section_id;
                }}
            >
                <div
                    class="border-stardew-border-dark mt-0.5 grid size-6 shrink-0 place-content-center border-2 {selectedSection ===
                    section_id
                        ? "bg-[url('assets/stardew-checkbox-cross.svg')] bg-cover bg-center"
                        : ''}"
                ></div>
                <span>{title}</span>
            </a>
        {/each}
    </div>
</div>
