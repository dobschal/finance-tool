import {type Entry} from "../types/Entry.ts";
import type {Category, CategoryDto} from "../types/Category.ts";
import {dateStringToMonthDisplay, ensure, formatCurrency, type Optional} from "../lib/util.ts";
import {getFilteredEntriesWithCategories} from "./entryService.ts";
import {categories} from "../store.ts";

export function findCategoryForEntry(entry: Entry): Optional<Category> {
    return categories.value.find(category => {
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

export function getCategories(): Array<CategoryDto> {
    const t1 = Date.now();
    const entries = getFilteredEntriesWithCategories();
    const amountOfMonths = new Set(entries.map(entry => dateStringToMonthDisplay(entry.date))).size;
    const sumOfAllEntries = entries.reduce((sum, entry) => sum + entry.value, 0);

    const categoryDtos = categories.value.map(category => {
        const entriesInCategory = entries.filter(entry => entry.category?.id === category.id);
        const totalBalance = entriesInCategory.reduce((sum, entry) => sum + entry.value, 0);
        const categoryDto: CategoryDto = {
            ...category,
            totalBalance,
            totalBalanceFormatted: formatCurrency(totalBalance, "EUR"),
            averageBalancePerMonth: formatCurrency((totalBalance / amountOfMonths), "EUR"),
            amountOfEntries: entriesInCategory.length,
            averageAmountPerMonth: entriesInCategory.length / amountOfMonths,
            percentOfTotal: totalBalance / sumOfAllEntries,
        };
        return categoryDto;
    });

    // Remove old "uncategorized" category
    const uncategorizedIndex = categoryDtos.findIndex(category => category.id === "uncategorized");
    if (uncategorizedIndex !== -1) {
        categoryDtos.splice(uncategorizedIndex, 1);
    }

    // Add category for entries without a category
    const entriesWithoutCategory = entries.filter(entry => !entry.category);
    if (entriesWithoutCategory.length > 0) {
        const totalBalanceForUncategorized = entriesWithoutCategory.reduce((sum, entry) => sum + entry.value, 0);
        categoryDtos.push({
            id: "uncategorized",
            name: "Uncategorized",
            color: "var(--grey-10)",
            filter: "",
            filterOptions: {},
            totalBalanceFormatted: formatCurrency(totalBalanceForUncategorized, "EUR"),
            totalBalance: totalBalanceForUncategorized,
            averageBalancePerMonth: formatCurrency((totalBalanceForUncategorized / amountOfMonths) || 0, "EUR"),
            amountOfEntries: entriesWithoutCategory.length,
            percentOfTotal: totalBalanceForUncategorized / sumOfAllEntries,
            averageAmountPerMonth: entriesWithoutCategory.length / amountOfMonths,
            isExcluded: false,
        });
    }

    categoryDtos.sort((a, b) => {
        const totalBalanceA = ensure(a.totalBalance);
        const totalBalanceB = ensure(b.totalBalance);
        return totalBalanceA - totalBalanceB;
    });

    console.log("Getting categories took: ", Date.now() - t1, "ms");

    return categoryDtos;
}
