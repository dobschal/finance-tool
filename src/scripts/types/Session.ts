import type {Entry} from "./Entry.ts";
import type {Category} from "./Category.ts";
import type {EntryFilter} from "./EntryFilter.ts";
import {isNonEmptyString} from "../lib/util.ts";

export interface Session {
    id: string;
    name: string;
    entries: Array<Entry>,
    categories: Array<Category>,
    entryFilter: EntryFilter,
}

export function isSession(val: unknown): val is Session {
    const session = val as Session;
    return isNonEmptyString(session.id) && isNonEmptyString(session.name) && Array.isArray(session.categories) && Array.isArray(session.entries);
}