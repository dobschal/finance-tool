import type {EntryDto} from "../types/Entry.ts";
import {entries, entryFilter} from "../store.ts";
import {formatCurrency, getLastDayOfMonth, toDate} from "../lib/util.ts";
import {findCategoryForEntry} from "./categoryService.ts";

export function getEntriesWithCategories(): Array<EntryDto> {
    return entries.value
        .map(entry => {
            return {
                ...entry,
                balanceFormatted: formatCurrency(entry.balance, entry.currency),
                valueFormatted: formatCurrency(entry.value, entry.currency),
                category: findCategoryForEntry(entry)
            };
        });
}

export function getFilteredEntriesWithCategories(): Array<EntryDto> {
    const startDate = entryFilter.value.startMonth ? toDate("01." + entryFilter.value.startMonth) : undefined;
    const endDate = entryFilter.value.endMonth ? getLastDayOfMonth(toDate("01." + entryFilter.value.endMonth)) : undefined;
    return getEntriesWithCategories()
        .filter(entry => {
            if (!(entryFilter.value.includeEarnings || entry.value < 0)) {
                return false;
            }
            if (startDate && toDate(entry.date) < startDate) {
                return false;
            }
            if (endDate && toDate(entry.date) > endDate) {
                return false;
            }
            return true;
        });
}
