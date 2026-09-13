<script lang="ts">
    import Question from './Question.svelte';

    interface Props {
        title: string;
        value: string;
        placeholder?: string;
        rows?: number;
    }

    // eslint-disable-next-line prefer-const
    let { title, value = $bindable(), placeholder = '', rows = 2 }: Props = $props();
</script>

<Question {title}>
    <textarea
        bind:value
        {placeholder}
        {rows}
        class="border-t-stardew-bg-dark border-l-stardew-bg-light border-b-stardew-bg-light border-r-stardew-bg-dark text-stardew-font-color font-stardew-body w-full border-2 text-lg focus:outline-none"
    ></textarea>
</Question>
