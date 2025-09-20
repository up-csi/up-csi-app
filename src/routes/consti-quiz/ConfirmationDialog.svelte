<script>
    // eslint-disable-next-line prefer-const
    let { showModal = $bindable(false), onConfirm /* children*/ } = $props();

    let dialog = $state();

    $effect(() => {
        // console.log("showModal:",showModal);
        if (showModal) dialog.showModal();
    });
</script>

<div class="flex h-full w-full">
    <dialog
        class="max-h-6/12 min-h-2/12 max-w-6/12 min-w-4/12 m-auto bg-transparent text-[#F9FAFB]"
        bind:this={dialog}
        onclose={() => (showModal = false)}
        onclick={e => {
            if (e.target === dialog) dialog.close();
        }}
    >
        <div class="bg-csi-neutral-900 flex h-full w-full flex-col gap-y-2.5 rounded-2xl p-6">
            <div class="mb-2">
                <!-- {@render children?.()} -->
                <h2 class="mb-4 text-3xl font-bold text-white">Submit Quiz</h2>
                <p class="text-justify">
                    Please take your time and check your answers before submitting. Once you submit, you may no longer
                    change or review your answers.
                </p>
            </div>
            <div class="flex flex-row justify-center gap-x-4">
                <button
                    class="bg-csi-grey rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onclick={async () => {
                        dialog.close();
                        await onConfirm();
                    }}
                >
                    Confirm
                </button>
                <button
                    class="bg-csi-grey rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onclick={() => dialog.close()}
                >
                    Cancel
                </button>
            </div>
        </div>
    </dialog>
</div>

<style>
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.6);
    }
    dialog > div {
        padding: 1em;
    }
</style>
