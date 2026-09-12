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
    <textarea bind:value {placeholder} {rows} class="text-lg w-full focus:outline-none border-2 border-t-stardew-bg-dark border-l-stardew-bg-light border-b-stardew-bg-light border-r-stardew-bg-dark text-stardew-font-color font-stardew-body"
    ></textarea>
</Question>
