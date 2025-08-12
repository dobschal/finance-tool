import type {Optional} from "./util.ts";
import type {Entry} from "./types/Entry.ts";
import type {Category} from "./types/Category.ts";
import type {EntryFilter} from "./types/EntryFilter.ts";
import type {Session} from "./types/Session.ts";

interface Storage {
    entries: Array<Entry>;
    categories: Array<Category>;
    entryFilter: EntryFilter;
    sessions: Array<Session>;
}

const updateBounces: Record<string, Optional<ReturnType<typeof setTimeout>>> = {};
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
    _notify(key);
}

export function clear<K extends keyof Storage>(...keys: Array<K>): void {
    for (const key of keys) {
        window.localStorage.removeItem(key);
        _notify(key);
    }
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

function _notify<K extends keyof Storage>(key: K): void {
    if (updateBounces[key]) {
        clearTimeout(updateBounces[key]);
    }
    updateBounces[key] = setTimeout(() => {
        updateBounces[key] = undefined;
        console.log("Store changed for: ", key);
        const callbacks = (listeners[key] ?? []).concat(listeners["*"] ?? []);
        callbacks.forEach(callback => callback());
    });
}
