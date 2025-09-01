<script lang="ts">
    import './app.css';
    import CSI_Logo from '$lib/icons/upcsi.svg';
    import HAM_MENU from '$lib/icons/ham_menu.svg';
    import NavBar from '$lib/NavBar.svelte';
    import { page } from '$app/state';

    import { invalidate } from '$app/navigation';
    import { onMount } from 'svelte';
    const { data, children } = $props();
    const { session, supabase } = $derived(data);
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
    <header class="flex w-full items-center px-16 py-4" style="background-Color: #212121">
        <button
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
            <div class="flex w-64">
                <NavBar />
            </div>
        {/if}

        <div class="flex {page.url.pathname === '/login/' ? 'w-full' : 'w-[calc(100%-16rem)]'}">
            {@render children()}
        </div>
    </div>
{/if}
