import {writable} from 'svelte/store';
export const uuid = writable("");

const store = writable(new Set());

export const filledSigsheet = {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    add(id: string) {
        store.update(set => {
            const newSet =  new Set(set);
            newSet.add(id);
            return newSet;
        });
    }
};
