import { writable } from 'svelte/store';

export const uuid = writable('');
export const username = writable('');
<<<<<<< HEAD

export const gdrive_folder_id = writable('');
export const gdrive_root_folder = '1caL05EFKPFVySv4slWpDJERlD6zRBPGW';
=======
>>>>>>> d5a2871 (feat(sigsheet): each applicant has will get their own gdrive folder)

export const gdrive_folder_id = writable('');
export const gdrive_root_folder = '1caL05EFKPFVySv4slWpDJERlD6zRBPGW'; 

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
