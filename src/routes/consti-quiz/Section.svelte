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
        <div
            class="
            inline-block border-x-32
            border-y-16 border-solid
            px-2
            py-1
            [border-image-repeat:repeat]
            [border-image-slice:16_32_16_32_fill]
            [border-image-source:url('assets/stardew-banner.svg')]
            [image-rendering:-moz-crisp-edges]
            [image-rendering:crisp-edges] [image-rendering:pixelated]
        "
        >
            <p class="font-stardew-body">
                <span class="text-2xl text-[#00C6D7] md:text-3xl">{title}</span>
                <span class="text-stardew-font-color text-lg whitespace-nowrap md:text-xl">[{points} Points]</span>
            </p>
        </div>

        {#if description}
            <p class="mt-2">{description}</p>
        {/if}
    </div>
    {@render children?.()}
</div>
