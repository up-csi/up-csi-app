import { writable } from 'svelte/store';

export const uuid = writable('');

// export const gdrive_folder = writable('');
export const gdrive_folder_id = '1caL05EFKPFVySv4slWpDJERlD6zRBPGW'; // TODO

const store = writable(new Set());

export const filledSigsheet = {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    add(id: string) {
        store.update(set => {
            const newSet = new Set(set);
            newSet.add(id);
            return newSet;
        });
    },
};
