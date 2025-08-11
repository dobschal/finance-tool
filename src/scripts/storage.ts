import type {Optional} from "./util.ts";
import type {Entry} from "./types/Entry.ts";
import type {Category} from "./types/Category.ts";
import type {EntryFilter} from "./types/EntryFilter.ts";

interface Storage {
    entries: Array<Entry>;
    categories: Array<Category>;
    entryFilter: EntryFilter;
}

let updateBounce: Optional<ReturnType<typeof setTimeout>>;
const listeners: Record<string, Array<() => void>> = {};

// Listen to storage changes, Pass "*" as key to listen to all changes
export function subscribeStore(key: string, callback: () => void): void {
    if (!listeners[key]) {
        listeners[key] = [];
    }
    listeners[key].push(callback);
    callback(); // Call the callback immediately to ensure it runs with the current state
}

export function store<K extends keyof Storage>(key: K, value: Storage[K]): void {
    window.localStorage.setItem(key, JSON.stringify(value));
    if (updateBounce) {
        console.info("Update bounce is already set, clearing it to prevent multiple updates.");
        clearTimeout(updateBounce);
    }
    updateBounce = setTimeout(() => {
        updateBounce = undefined;
        const callbacks = (listeners[key] ?? []).concat(listeners["*"] ?? []);
        callbacks.forEach(callback => callback());
    });
}

export function retrieve<K extends keyof Storage>(key: K): Optional<Storage[K]> {
    const value = window.localStorage.getItem(key);
    if (value === null) return;
    try {
        return JSON.parse(value) as Storage[K];
    } catch (e) {
        console.error(`Failed to parse stored value for key "${key}":`, e);
    }
}
