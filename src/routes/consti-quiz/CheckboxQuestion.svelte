<script lang="ts">
    import Question from './Question.svelte';

    interface Item {
        id: number;
        label: string;
    }

    // eslint-disable-next-line prefer-const
    let { title = '', value = $bindable(''), items = [] as Item[] } = $props();

    function addOption(option: string) {
        const valueSet: Set<string> = new Set(
            value
                .toString()
                .split('-')
                .filter(v => v !== ''),
        );
        valueSet.add(option);
        const valueList = Array.from(valueSet);
        value = valueList.join('-');
        console.log(value);
    }

    function removeOption(option: string) {
        const valueList: Array<string> = value
            .toString()
            .split('-')
            .filter(v => v !== option);
        value = valueList.join('-');
        console.log(valueList);
    }

    function isSelected(option: string) {
        return value.toString().split('-').includes(option);
    }
</script>

<Question {title}>
    {#each items as item, i (i)}
        <label class="flex items-center space-x-3">
            <input
                type="checkbox"
                onchange={() => {
                    if (!isSelected(item.id.toString())) {
                        addOption(item.id.toString());
                    } else {
                        removeOption(item.id.toString());
                    }

                    value = `${value}`;
                }}
                class="form-checkbox h-5 w-5"
                checked={isSelected(item.id.toString())}
            />
            <span class="text-md">{item.label}</span>
        </label>
    {/each}
</Question>
