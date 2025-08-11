import {retrieve} from "../storage.ts";
import {formatCurrency} from "../util.ts";
import {findCategory} from "./categoryService.ts";
import type {Entry, EntryDto} from "../types/Entry.ts";
import type {Category} from "../types/Category.ts";

export function getEntriesWithCategories(bypassFilter: boolean = false): Array<EntryDto> {
    const entryFilter = retrieve("entryFilter");
    const categories = retrieve("categories") ?? [];
    let entries = retrieve("entries") ?? [];
    if (!entryFilter?.includeEarnings) {
        entries = entries.filter(entry => entry.value < 0);
    }
    const filteredEntries: Array<Entry & {
        balanceFormatted?: string,
        valueFormatted?: string
        category?: Category
    }> = entries.filter(entry => bypassFilter || !entry.isHidden);
    filteredEntries.forEach(entry => {
        entry.balanceFormatted = formatCurrency(entry.balance, entry.currency);
        entry.valueFormatted = formatCurrency(entry.value, entry.currency);
        entry.category = findCategory(entry, categories);
    });
    return filteredEntries;
}
