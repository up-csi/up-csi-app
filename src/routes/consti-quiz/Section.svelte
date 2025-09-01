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
    <div class="mb-3 rounded-lg bg-[#303032] p-6">
        <p class="mb-4 text-xl font-medium">
            <span class="text-[#00C6D7]">{title}</span> [{points} Points]
        </p>
        {#if description}
            <p>{description}</p>
        {/if}
    </div>
    {@render children?.()}
</div>
