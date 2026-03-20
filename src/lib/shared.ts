import { writable } from 'svelte/store';

export const uuid = writable('');
export const username = writable('');

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

export const applicant_names_list = writable<string[]>([]);

export interface mem {
    member_id: number;
    member_name: string;
    member_committee: string;
    role: string;
    photo: string;
}

export const members = writable<mem[]>([]);
