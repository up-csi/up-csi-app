<script lang="ts">
    import Question from './Question.svelte';

    interface Item {
        id: number;
        label: string;
    }

    let { title = '', value = $bindable(''), items = [] as Item[], other = false } = $props();

    function addOption(option: string) {
        const valueList: Array<string> = value.split(',').filter(v => v != '');
        valueList.push(option);
        value = valueList.join(',');
        console.log(valueList);
    }

    function removeOption(option: string) {
        const valueList: Array<string> = value.split(',').filter(v => v != option);
        value = valueList.join(',');
        console.log(valueList);
    }
</script>

<Question {title}>
    {#each items as item, i (i)}
        <label class="flex items-center space-x-3">
            <input
                type="checkbox"
                onchange={e => {
                    if (e.target.checked) {
                        addOption(item.id);
                    } else {
                        removeOption(item.id);
                    }
                }}
                class="form-checkbox h-5 w-5"
            />
            <span class="text-md">{item.label}</span>
        </label>
    {/each}
</Question>
