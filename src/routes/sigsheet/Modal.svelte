<script lang="ts">
    import { applicant_names_list, filledSigsheet, gdrive_folder_id, username, uuid } from '$lib/shared';
    import { writable } from 'svelte/store';

    const { member_id, name, role, closeModal, activeCategory } = $props();
    // Implement color of name

    const categoryColors: Record<string, string> = {
        Exec: 'var(--color-csi-blue)',
        'M&I': 'var(--color-mni-pink)',
        Service: 'var(--color-service-yellow)',
        Innov: 'var(--color-innov-orange)',
        Engg: 'var(--color-engg-blue)',
        Exte: 'var(--color-exte-blue)',
        'B&C': 'var(--color-bnc-green)',
    };

    const imageURL = writable<string | null>(null);

    let submitting = $state(false);
    async function handleSubmit(event: Event) {
        event.preventDefault();

        if (submitting) return;
        submitting = true;

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            console.log('Start /api/upload.');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error uploading data:', error);
                alert(error.error);
            } else {
                const data = await response.json();
                console.log('Data uploaded successfully:', data);
                filledSigsheet.add(member_id);
                console.log('ADDED TO FILLED SIGSHEET', $filledSigsheet);
                alert('Data uploaded successfully!');
            }
            closeModal();
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    }

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            imageURL.set(URL.createObjectURL(file));
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
    <div
        class="relative mt-[15vh] mb-[5vh] max-h-[75vh] w-[95%] max-w-3xl overflow-x-hidden overflow-y-auto rounded-xl bg-[#2f2f32] p-6 shadow-lg md:mt-0 md:mb-0"
    >
        <!-- Close button -->
        <div class="mb-3 flex justify-end">
            <button
                aria-label="Close modal"
                onclick={closeModal}
                class="text-csi-white hover:text-csi-blue cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-[30px] fill-current"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Form -->
        <form class="grid grid-cols-1 gap-6 md:grid-cols-2" onsubmit={handleSubmit}>
            <!-- hidden inputs -->
            <input type="text" name="gdrive_folder_id" value={$gdrive_folder_id} hidden required />
            <input type="text" name="username" value={$username} hidden required />
            <input type="text" name="uuid" value={$uuid} hidden required />

            <!-- Left column -->
            <div class="mx-2">
                {#if activeCategory !== 'CoApp'}
                    <h2 class="pb-1 text-2xl font-bold md:text-4xl" style="color:{categoryColors[activeCategory]}">
                        {name}
                    </h2>
                    <h3 class="text-csi-white text-sm">{role}</h3>
                    <input type="text" name="member_id" value={member_id} hidden required />
                    <input type="text" name="member_name" value={name} hidden required />
                {:else}
                    <div class="relative w-full">
                        <!-- Dropdown button -->
                        <button
                            type="button"
                            class="text-csi-white w-full rounded-lg bg-[#161619] px-4 py-2 text-left font-medium"
                            onclick={toggleDropdown}
                        >
                            {#if selectedCoApp}
                                {selectedCoApp}
                            {:else}
                                Select co-applicant
                            {/if}
                        </button>

                        <!-- Dropdown menu -->
                        {#if isDropdownOpen}
                            <ul
                                class="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg bg-[#2f2f32] shadow-lg"
                            >
                                {#each $applicant_names_list as co_app_name}
                                    <li>
                                        <button
                                            type="button"
                                            class="text-csi-white hover:bg-csi-blue w-full px-4 py-2 text-left hover:text-black"
                                            onclick={() => selectCoAppName(co_app_name)}
                                        >
                                            {co_app_name}
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                    <input type="text" name="member_name" value={selectedCoApp} hidden required />
                {/if}

                <label for="question" class="text-csi-white mb-1 block pt-5 text-lg font-bold md:text-2xl">
                    Your Question
                </label>
                <textarea
                    id="question"
                    name="question"
                    class="text-csi-white mb-3 w-full rounded-xl bg-[#161619] px-4 py-2 text-sm font-light"
                    placeholder="Type your question here ..."
                    style="height: 100px; resize: none"
                    required
                ></textarea>

                <label for="answer" class="text-csi-white mb-1 block text-lg font-bold md:text-2xl">
                    Their Answer
                </label>
                <textarea
                    id="answer"
                    name="answer"
                    class="text-csi-white mb-3 w-full rounded-xl bg-[#161619] px-4 py-2 text-sm font-light"
                    placeholder="Type their answer here ..."
                    style="height: 100px; resize: none"
                    required
                ></textarea>
            </div>

            <!-- Right column -->
            <div class="mx-2 flex flex-col items-center justify-center gap-5">
                <!-- Image uploader -->
                <label
                    for="img-input"
                    class="border-csi-blue box-border flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 p-6"
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
                        {#if $imageURL}
                            <img
                                src={$imageURL}
                                alt="selfie with member"
                                class="aspect-square h-40 w-40 max-w-full rounded-2xl object-cover md:h-56 md:w-56"
                            />
                        {:else}
                            <div class="flex flex-col items-center justify-center px-4">
                                <!-- Responsive SVG size using Tailwind -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.0"
                                    stroke="#00C6D7"
                                    class="aspect-square h-30 w-30 max-w-full rounded-2xl object-cover md:my-6 md:h-30 md:w-30"
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

                                <p class="text-csi-blue mt-2 text-center text-xl">Click to submit</p>
                            </div>
                        {/if}
                    </div>
                </label>

                <!-- Submit button -->
                <button
                    class="bg-csi-blue bg-opacity-10 hover:bg-innov-orange mb-3 w-50 max-w-xs rounded-full px-6 py-3 text-lg font-semibold"
                    disabled={submitting}
                >
                    {#if submitting}
                        Submitting...
                    {:else}
                        Submit
                    {/if}
                </button>
            </div>
        </form>
    </div>
</main>
