<script>
    import { BookCheck, LayoutDashboard, LogOut, NotebookPen, X } from '@lucide/svelte';
    import { page } from '$app/state';
    const Placeholder_Icon = `/assets/members/LinoPlaceholder.webp`; 
    const options = ['Dashboard', 'Signature Sheet', 'Constitution Quiz'];
    const filenames = ['/', '/sigsheet/', '/consti-quiz/'];
    const icon_class = 'h-6 w-6';
    // eslint-disable-next-line prefer-const
    let { user, isNavBarOpen = $bindable() } = $props();
</script>

<div class="bg-csi-black fixed flex h-screen flex-initial flex-col px-2 pt-8 sm:px-8">
    <div class="mx-8 flex hover:cursor-pointer sm:mx-1">
        <X class="text-csi-white ml-auto {icon_class}" onclick={() => (isNavBarOpen = false)} />
    </div>
    <div class="mb-8 flex w-full flex-col items-center justify-center sm:p-4">
        <div class="w-screen text-center sm:w-48">
            <img
                src={Placeholder_Icon}
                class="mx-auto mb-4 h-48 w-48 flex-shrink-0 rounded-full object-cover"
                alt="Profile placeholder pic"
            />
            <p class="text-csi-white text-2xl font-bold">{user.email.slice(0, user.email.indexOf('@'))}</p>
        </div>
    </div>

    <div class="flex flex-1 flex-col overflow-y-auto">
        {#each options as option, i (option)}
            <a class="my-2 flex w-full" href={filenames[i]}>
                <div
                    class="text-csi-white flex w-full items-center p-3 font-medium
                        {page.url.pathname !== filenames[i]
                        ? 'hover:bg-csi-neutral-100 hover:text-csi-black rounded-3xl opacity-50 ease-in-out hover:opacity-100 hover:duration-300'
                        : 'font-bold'}"
                >
                    <!-- Options -->
                    {#if option === 'Dashboard'}
                        <LayoutDashboard class={icon_class} />
                    {:else if option === 'Signature Sheet'}
                        <NotebookPen class={icon_class} />
                    {:else}
                        <BookCheck class={icon_class} />
                    {/if}
                    <div class="ml-4 w-3/4">{option}</div>
                </div>
            </a>
        {/each}
    </div>

    <form class="mt-auto mb-10" action="/logout" method="POST">
        <div
            class="text-csi-white hover:bg-csi-neutral-100 hover:text-csi-black flex w-full cursor-pointer gap-2 rounded-full p-3 font-medium
                        opacity-50 ease-in-out hover:font-medium hover:opacity-100 hover:duration-100"
        >
            <LogOut class={icon_class} />
            <button type="submit" class="w-3/4 cursor-pointer">Log Out</button>
        </div>
    </form>
</div>
