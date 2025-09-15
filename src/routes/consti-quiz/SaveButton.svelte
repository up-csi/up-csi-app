<script lang="ts">
    const { saveAnswers } = $props();

    let isSaving = $state(false);
    let saveMessage = $state('');
    let messageTimeout: ReturnType<typeof setTimeout> | null = null;

    async function handleSave() {
        isSaving = true;
        saveMessage = '';
        try {
            await saveAnswers();
            saveMessage = 'Progress saved successfully!';

            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }

            // hide message after 3 seconds
            messageTimeout = setTimeout(() => {
                saveMessage = '';
            }, 2000);
        } catch (err) {
            console.error(err);
            saveMessage = 'Failed to save progress.';

            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }

            // hide message after 3 seconds
            setTimeout(() => {
                saveMessage = '';
            }, 2000);
        } finally {
            setTimeout(() => {
                isSaving = false;
            }, 2000);
        }
    }
</script>

<div class="fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 transform flex-col items-center space-y-2 md:left-1/5">
    <button
        onclick={handleSave}
        class="bg-csi-blue rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSaving}
    >
        {isSaving ? 'Saving...' : 'Save Answers'}
    </button>

    {#if saveMessage}
        <div class="bg-csi-grey rounded px-3 py-1 text-sm text-white shadow-md">
            {saveMessage}
        </div>
    {/if}
</div>
