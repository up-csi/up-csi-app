<script lang="ts">
    import Question from './Question.svelte';

    interface Props {
        title: string;
        value: string;
        placeholder?: string;
    }

    // eslint-disable-next-line prefer-const
    let { title, value = $bindable(), placeholder = '' }: Props = $props();
</script>

<Question {title}>
    <input type="text" bind:value {placeholder} class="text-lg w-full focus:outline-none border-2 border-t-stardew-bg-dark border-l-stardew-bg-light border-b-stardew-bg-light border-r-stardew-bg-dark text-stardew-font-color font-stardew-body" />
</Question>
