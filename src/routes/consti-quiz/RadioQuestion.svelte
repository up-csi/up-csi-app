<script lang="ts">
    import Question from './Question.svelte';

    interface Item {
        id: number;
        label: string;
    }

    // eslint-disable-next-line prefer-const
    let { title = '', value = $bindable(''), items = [] as Item[], other = false } = $props();
    let otherValue = $state('');
</script>

<Question {title}>
    {#each items as item, i (i)}
        <label class="flex items-center space-x-3">
            <input type="radio" bind:group={value} value={item.id} class="form-radio h-5 w-5" />
            <span class="text-md">{item.label}</span>
        </label>
    {/each}
    {#if other}
        <label class="flex items-center space-x-3">
            <input type="radio" bind:group={value} value={otherValue} class="form-radio h-5 w-5" />
            <span class="text-md">Other:</span>
            <input
                type="text"
                bind:value={otherValue}
                placeholder="Enter response..."
                onfocus={() => (value = otherValue)}
                oninput={() => (value = otherValue)}
            />
        </label>
    {/if}
</Question>
