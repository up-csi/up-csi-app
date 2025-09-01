<script lang="ts">
    import Question from './Question.svelte';

    interface Props {
        title: string;
        value: string;
        placeholder?: string;
        rows?: number;
    }

    let { title, value = $bindable(), placeholder = '', rows = 2 }: Props = $props();
</script>

<Question {title}>
    <textarea bind:value {placeholder} {rows} class="w-full rounded border-none focus:ring-2 focus:outline-none"
    ></textarea>
</Question>
