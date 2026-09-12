<script lang="ts">
    import { applicant_names_list, filledSigsheet, gdrive_folder_id, username, uuid } from '$lib/shared';

    const { member_id, member_name, role, closeModal, activeCategory } = $props();
    // Implement color of name

    /* const categoryColors: Record<string, string> = {
        Exec: 'var(--color-csi-blue)',
        'M&I': 'var(--color-mni-pink)',
        Service: 'var(--color-service-yellow)',
        Innov: 'var(--color-innov-orange)',
        Engg: 'var(--color-engg-blue)',
        Exte: 'var(--color-exte-blue)',
        'B&C': 'var(--color-bnc-green)',
    }; */

    let imageURL = $state<string | null>(null);
    let statusMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

    let submitting = $state(false);
    async function handleSubmit(event: Event) {
        event.preventDefault();

        if (submitting) return;
        submitting = true;
        statusMessage = null;

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                statusMessage = { type: 'error', text: error.error ?? 'Upload failed' };
            } else {
                await response.json();
                filledSigsheet.add(member_id);
                statusMessage = { type: 'success', text: 'Data uploaded successfully!' };
                setTimeout(() => closeModal(), 1500);
            }
        } catch {
            statusMessage = { type: 'error', text: 'An unexpected error occurred. Please try again.' };
        } finally {
            submitting = false; // eslint-disable-line require-atomic-updates
        }
    }

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            imageURL = URL.createObjectURL(file);
        }
    }

    let isDropdownOpen = $state(false);
    let selectedCoApp = $state('');

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function selectCoAppName(co_app_name: string) {
        selectedCoApp = co_app_name;
        toggleDropdown();
    }
</script>

<main class="font-inter fixed inset-0 flex items-center justify-center p-4">
    <div class="p-1 mt-[15vh] mb-[5vh] max-h-[75vh] max-w-2xl bg-stardew-border-fill relative flex justify-center align-middle border-6 border-stardew-border-dark">
        <div
            class="relative p-6 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-stardew-bg-light to-stardew-bg-dark border-6 border-stardew-border-dark shadow-lg md:mt-0 md:mb-0"
        >
            <!-- Close button -->
            <div class="flex justify-end">
                <button
                    disabled={submitting}
                    aria-label="Close modal"
                    onclick={closeModal}
                    class="text-engg-red hover:text-csi-blue cursor-pointer font-stardew-body text-4xl"
                >
                    <!-- <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-[30px] fill-current"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg> -->
                    x
                </button>
            </div>

            <!-- Form -->
            <form class="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch" onsubmit={handleSubmit}>
                <!-- hidden inputs -->
                <input type="text" name="gdrive_folder_id" value={$gdrive_folder_id} hidden required />
                <input type="text" name="username" value={$username} hidden required />
                <input type="text" name="uuid" value={$uuid} hidden required />

                <!-- Left column -->
                <div class="flex flex-col gap-4">
                    {#if activeCategory !== 'CoApp'}
                        <div class="border-4 border-l-stardew-border-light border-b-stardew-border-light border-t-stardew-border-shadow border-r-stardew-border-shadow px-2">
                            <h2 class="pb-1 font-stardew-body text-3xl text-stardew-font-color md:text-5xl">
                                {member_name}
                            </h2>
                            <h3 class="font-stardew-body text-xl text-stardew-font-color">{role}</h3>
                        </div>
                        
                        <input type="text" name="member_id" value={member_id} hidden required />
                        <input type="text" name="member_name" value={member_name} hidden required />
                    {:else}
                        <div class="relative w-full border-4 border-l-stardew-border-light border-b-stardew-border-light border-t-stardew-border-shadow border-r-stardew-border-shadow p-2">
                            <button
                                type="button"
                                class="w-full rounded-lg bg-[#161619] px-4 py-2 text-left font-stardew-body text-xl text-csi-white"
                                onclick={toggleDropdown}
                            >
                                {#if selectedCoApp}
                                    {selectedCoApp}
                                {:else}
                                    Select co-applicant
                                {/if}
                            </button>

                            {#if isDropdownOpen}
                                <ul class="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg bg-[#2f2f32] shadow-lg">
                                    {#each $applicant_names_list as co_app_name (co_app_name)}
                                        <li>
                                            <button
                                                type="button"
                                                class="w-full px-4 py-2 text-left font-stardew-body text-csi-white hover:bg-csi-blue hover:text-black"
                                                onclick={() => selectCoAppName(co_app_name)}
                                            >
                                                {co_app_name}
                                            </button>
                                        </li>
                                    {/each}
                                </ul>
                            {/if}
                        </div>
                        <input type="text" name="member_name" class="font-stardew-body" value={selectedCoApp} hidden required />
                    {/if}

                    <div class="flex flex-col border-4 border-l-stardew-border-light border-b-stardew-border-light border-t-stardew-border-shadow border-r-stardew-border-shadow px-2">
                        <label for="question" class="block pt-2 mb-1 font-stardew-body text-xl text-stardew-font-color md:text-3xl">
                            Your Question
                        </label>
                        <textarea
                            id="question"
                            name="question"
                            class="mb-3 w-full min-h-[100px] resize-none rounded-xl bg-[#161619] px-4 py-2 font-stardew-body text-xl text-csi-white"
                            placeholder="Type your question here ..."
                            required
                        ></textarea>
                    </div>

                    <div class="flex flex-col border-4 border-l-stardew-border-light border-b-stardew-border-light border-t-stardew-border-shadow border-r-stardew-border-shadow px-2">
                        <label for="answer" class="block mb-1 font-stardew-body text-xl text-stardew-font-color md:text-3xl">
                            Their Answer
                        </label>
                        <textarea
                            id="answer"
                            name="answer"
                            class="mb-3 w-full min-h-[100px] resize-none rounded-xl bg-[#161619] px-4 py-2 font-stardew-body text-xl text-csi-white"
                            placeholder="Type their answer here ..."
                            required
                        ></textarea>
                    </div>
                </div>

                <!-- Right column -->
                <div class="flex h-full flex-col items-center justify-between gap-4">
                    <div class="relative w-full flex-1 min-h-[220px]">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="aspect-2/3 h-full max-w-full rounded-md border-4 border-stardew-border-dark bg-stardew-border-fill p-1 box-border">
                                <label
                                    for="img-input"
                                    class="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-sm border-4 border-stardew-border-dark bg-[url('/assets/bg_images/stardew_valley_image_bg.svg')] bg-cover bg-center bg-no-repeat p-4 box-border"
                                    style="background-color: rgba(0, 198, 215, 0.07);"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="img-input"
                                        name="image"
                                        onchange={handleFileChange}
                                        hidden
                                        required
                                    />

                                    <div class="flex w-full items-center justify-center">
                                        {#if imageURL}
                                            <img
                                                src={imageURL}
                                                alt="selfie with member"
                                                class="aspect-square h-40 w-40 max-w-full rounded-lg object-cover md:h-56 md:w-56"
                                            />
                                        {:else}
                                            <div class="flex flex-col items-center justify-center px-4 w-full">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="1.0"
                                                    stroke="#5c2c16"
                                                    class="aspect-square h-20 w-20 max-w-full rounded-2xl object-cover md:my-2 md:h-24 md:w-24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                                                    />
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                                                    />
                                                </svg>

                                                <p class="mt-2 w-full text-center font-stardew-body text-lg md:text-2xl text-innov-orange">Add Selfie w/ Member</p>
                                            </div>
                                        {/if}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {#if statusMessage}
                        <p
                            class="w-full rounded-lg px-4 py-2 text-center font-stardew-body text-lg 
                                {statusMessage.type === 'error'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-green-500/20 text-green-400'}"
                        >
                            {statusMessage.text}
                        </p>
                    {/if}

                    <div class="flex items-center justify-center w-fit max-w-xs rounded-lg border-4 border-stardew-border-dark bg-stardew-border-fill p-0.5 align-middle">
                        <button
                            class="w-full rounded-sm border-4 border-stardew-border-dark bg-stardew-bg-dark bg-opacity-10 px-10 py-2 font-stardew-body text-3xl cursor-pointer hover:bg-innov-orange"
                            disabled={submitting}
                        >
                            {#if submitting}
                                Submitting...
                            {:else}
                                Submit
                            {/if}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</main>
