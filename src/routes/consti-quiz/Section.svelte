<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = {
        id: string;
        title: string;
        description?: string;
        points: number;
        children?: Snippet;
    };

    const { id, title, description, points, children }: Props = $props();
</script>

<div {id}>
    <div class="mb-3 flex flex-col items-center text-center">
        <div class="
            inline-block border-solid
            border-x-32 border-y-16
            [border-image-source:url('assets/stardew-banner.svg')]
            [border-image-slice:16_32_16_32_fill]
            [border-image-repeat:repeat]
            [image-rendering:pixelated]
            [image-rendering:-moz-crisp-edges]
            [image-rendering:crisp-edges]
            py-1 px-2
        ">
            <p class="font-stardew-body">
                <span class="text-[#00C6D7] text-2xl md:text-3xl">{title}</span> <span class="text-lg md:text-xl">[{points} Points]</span>
            </p>
        </div>

        {#if description}
            <p class="mt-2">{description}</p>
        {/if}
    </div>
    {@render children?.()}
</div>