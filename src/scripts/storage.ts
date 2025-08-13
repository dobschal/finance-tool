import {ensure, type Optional} from "./util.ts";
import type {Entry} from "./types/Entry.ts";
import type {Category} from "./types/Category.ts";
import type {EntryFilter} from "./types/EntryFilter.ts";
import type {Session} from "./types/Session.ts";
import type {ApplicationState} from "./types/ApplicationState.ts";

interface Storage {
    entries: Array<Entry>;
    categories: Array<Category>;
    entryFilter: EntryFilter;
    sessions: Array<Session>;
    state: ApplicationState;
}

const updateBounces: Map<() => void, Optional<ReturnType<typeof setTimeout>>> = new Map();
const listeners: Record<string, Array<() => void>> = {};

/**
 * @param keys - keys, you want to listen too, comma separated
 * @param callback - is called write away and then on every change of the store
 */
export function subscribeStore(keys: string, callback: () => void): void {
    for (const key of keys.split(",").map(k => k.trim())) {
        if (!listeners[key]) {
            listeners[key] = [];
        }
        listeners[key].push(callback);
    }
    callback(); // Call the callback immediately to ensure it runs with the current state
}

export function store<K extends keyof Storage>(key: K, value: Storage[K]): void {
    window.localStorage.setItem(key, JSON.stringify(value));
    _notify(key);
}

export function storeProp<K extends keyof Storage, I extends keyof Storage[K]>(key: K, prop: I, value: Storage[K][I]): void {
    const obj: Storage[K] = ensure(retrieve(key));
    if (Array.isArray(obj)) {
        throw new Error(`The function storeProp cannot be used to modify arrays.`);
    }
    obj[prop] = value;
    store(key, obj);
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

// We are having a map with the listener callbacks as key and
// a timeout as value to handle too many calls. Clear the timeout
// before every call and set new. --> so updates are notifying
// each listener only one time, even if the listener listens to
// all keys
function _notify<K extends keyof Storage>(key: K): void {
    const callbacks = (listeners[key] ?? []);
    callbacks.forEach(callback => {
        if (updateBounces.has(callback)) {
            clearTimeout(updateBounces.get(callback));
        }
        updateBounces.set(callback, setTimeout(() => {
            console.log("📣 Calling " + (callback.name || "anonymousFunction") + " for store change of " + key)
            callback();
        }));
    });
}
