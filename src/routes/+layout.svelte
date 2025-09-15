<script lang="ts">
    import './app.css';
    import { filledSigsheet, gdrive_folder_id, username, uuid } from '$lib/shared';
    import CSI_Logo from '$lib/icons/upcsi.svg';
    import HAM_MENU from '$lib/icons/ham_menu.svg';
    import NavBar from '$lib/NavBar.svelte';
    import { page } from '$app/state';

    import { invalidate } from '$app/navigation';
    import { onMount } from 'svelte';

    const { data, children } = $props();
    const { session, supabase } = $derived(data);

    // Sync $lib variables to data props
    if (data?.uuid) uuid.set(data.uuid);
    if (data?.username) username.set(data.username);
    if (data?.filledSigsheet) filledSigsheet.set(data.filledSigsheet);
    if (data?.gdrive_folder_id) gdrive_folder_id.set(data.gdrive_folder_id);

    let isNavBarOpen = $state(false);
    onMount(() => {
        const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth');
            }
        });
        return () => data.subscription.unsubscribe();
    });
</script>

{#if !data.session}
    {@render children()}
{:else}
    <header class="bg-csi-black z-100 sticky top-0 flex w-full items-center px-16 py-4">
        <button
            class="cursor-pointer"
            onclick={() => {
                isNavBarOpen = !isNavBarOpen;
            }}
        >
            <img src={HAM_MENU} alt="Ham Menu" />
        </button>

        <div class="flex flex-grow items-center justify-center">
            <img src={CSI_Logo} class="mr-4 w-6" alt="UP CSI LOGO" />
            <div class="text-csi-blue align-middle text-2xl font-semibold">UP CSI</div>
        </div>

        <!-- light/dark switch -->
        <div></div>
    </header>

    <div class="flex w-full flex-row bg-[#161619]">
        {#if page.url.pathname !== '/login/'}
            {#if isNavBarOpen}
                <div
                    class="fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-700 ease-in-out"
                >
                    <NavBar user={data.user} bind:isNavBarOpen />
                </div>
            {/if}
        {/if}

        <div class="flex w-full justify-center">
            {@render children()}
        </div>
    </div>
{/if}
