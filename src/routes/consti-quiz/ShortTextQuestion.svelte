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
    <input type="text" bind:value {placeholder} class="w-full rounded border-none focus:ring-2 focus:outline-none" />
</Question>
