import {type Entry} from "../types/Entry.ts";
import type {Category, CategoryDto} from "../types/Category.ts";
import {ensure, formatCurrency, type Optional} from "../util.ts";
import {retrieve, store} from "../storage.ts";
import {getEntriesWithCategories} from "./entryService.ts";

export function findCategory(entry: Entry, categories: Array<Category>): Optional<Category> {
    return categories.find(category => {
        function includes(key: string) {
            if (!key) return false;
            return JSON.stringify(entry).toLowerCase().includes(key.toLowerCase());
        }

        function includesOneOf(...keys: Array<string>) {
            return keys.some(key => includes(key));
        }

        try {
            // replace "and" and "or" with their correct logical operations
            const filter = category.filter.replace(/ and /g, " && ").replace(/ or /g, " || ");
            let entryMatches = false;
            if (filter) {
                const filterFn = new Function("entry", "includes", "includesOneOf", `return ${filter}`);
                entryMatches = entryMatches || filterFn(entry, includes, includesOneOf);
            }
            if ((category.filterOptions?.includesOneOf?.length ?? 0) > 0) {
                entryMatches = entryMatches || includesOneOf(...category.filterOptions!.includesOneOf!);
            }
            if ((category.filterOptions?.includesAllOf?.length ?? 0) > 0) {
                entryMatches = entryMatches || category.filterOptions!.includesAllOf!.every(includes);
            }
            return entryMatches;
        } catch (error) {
            console.error(`Error evaluating filter for category "${category.name}":`, error);
        }
    });
}

export function saveCategory(category: Category): void {
    const categories = (retrieve("categories") ?? []).filter(c => c.id !== category.id);
    categories.push(category);
    store("categories", categories);
}

/**
 * @param bypassFilter - if true, the filter for "begin" and "until" months is ignored.
 */
export function getCategories(bypassFilter: boolean = false): Array<Category> {
    const entries = getEntriesWithCategories(bypassFilter);
    const amountOfMonths = new Set(entries.map(entry => entry.date.slice(3))).size;
    const categories: Array<CategoryDto> = retrieve("categories") ?? [];

    categories.forEach(category => {
        const e = entries.filter(entry => entry.category?.id === category.id);
        category.totalBalance = e.reduce((sum, entry) => sum + entry.value, 0);
        category.totalBalanceFormatted = formatCurrency(category.totalBalance, "EUR");
        category.averageBalancePerMonth = formatCurrency((category.totalBalance / amountOfMonths) || 0, "EUR");
    });

    // Remove old "uncategorized" category
    const uncategorizedIndex = categories.findIndex(category => category.id === "uncategorized");
    if (uncategorizedIndex !== -1) {
        categories.splice(uncategorizedIndex, 1);
    }

    // Add category for entries without a category
    const entriesWithoutCategory = entries.filter(entry => !entry.category);
    if (entriesWithoutCategory.length > 0) {
        const totalBalanceForUncategorized = entriesWithoutCategory.reduce((sum, entry) => sum + entry.value, 0);
        categories.push({
            id: "uncategorized",
            name: "Uncategorized",
            color: "var(--grey-30)",
            filter: "",
            totalBalanceFormatted: formatCurrency(totalBalanceForUncategorized, "EUR"),
            totalBalance: totalBalanceForUncategorized,
            averageBalancePerMonth: formatCurrency((totalBalanceForUncategorized / amountOfMonths) || 0, "EUR"),
        });
    }

    categories.sort((a, b) => {
        const totalBalanceA = ensure(a.totalBalance);
        const totalBalanceB = ensure(b.totalBalance);
        return totalBalanceA - totalBalanceB;
    });

    return categories
}
