<script lang="ts">
    const { saveAnswers, submitAnswers } = $props();

    let isSaving = $state(false);
    let isSubmitting = $state(false);
    let saveMessage = $state('');
    const messageTimeout: ReturnType<typeof setTimeout> | null = null;

    async function handleSave() {
        isSaving = true;
        saveMessage = '';
        try {
            const { message } = await saveAnswers();
            saveMessage = message;

            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
        } catch (err) {
            console.error(err);
            saveMessage = 'Failed to save progress';

            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
        } finally {
            // hide message after 2 seconds
            setTimeout(() => {
                saveMessage = '';
            }, 2000);
            isSaving = false;
        }
    }

    async function handleSubmit() {
        isSubmitting = true;
        saveMessage = '';

        // save answers first
        await saveAnswers();

        try {
            const { message } = await submitAnswers();
            saveMessage = message;

            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
        } catch (error) {
            console.error(error);
            saveMessage = 'Failed to submit answers';

            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
        } finally {
            // hide message after 2 seconds
            setTimeout(() => {
                saveMessage = '';
            }, 2000);

            isSubmitting = false;
            window.location.reload();
        }
    }
</script>

<div class="md:left-1/5 fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 transform flex-col items-center space-y-2">
    <div class="flex gap-4">
        <button
            onclick={async () => {
                await handleSave();
            }}
            class="bg-csi-blue rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
        >
            {isSaving ? 'Saving...' : 'Save Answers'}
        </button>

        <button
            onclick={handleSubmit}
            class="bg-csi-grey rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
        >
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
        </button>
    </div>

    {#if saveMessage}
        <div class="bg-csi-grey rounded px-3 py-1 text-sm text-white shadow-md">
            {saveMessage}
        </div>
    {/if}
</div>
