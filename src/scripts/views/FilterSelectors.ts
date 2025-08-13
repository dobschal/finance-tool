import {ensure, onChange, referenceDom, toDate, updateDom} from "../util.ts";
import {retrieve, store, subscribeStore} from "../storage.ts";
import type {EntryFilter} from "../types/EntryFilter.ts";
import {getEntriesWithCategories} from "../service/entryService.ts";
import type {Entry, EntryDto} from "../types/Entry.ts";
import {getCategories} from "../service/categoryService.ts";

// region setup

const dom = referenceDom<{
    startMonthSelect: HTMLSelectElement;
    endMonthSelect: HTMLSelectElement;
    includeEarningsCheckbox: HTMLInputElement;
    categorySelect: HTMLSelectElement;
}>();

const template = `
<div class="form-group">
    <div class="horizontal">
        <div class="form-group">
            <label for="start-month-select">Begin with</label>
            <select name="start-month-select" id="start-month-select">
                <option value="01.1970">Select month...</option>
                {{#months}}
                    <option value="{{month}}" {{#isStartMonth}}selected{{/isStartMonth}}>{{month}}</option>
                {{/months}}
            </select>
        </div>
        <div class="form-group">
            <label for="end-month-select">Until</label>
            <select name="end-month-select" id="end-month-select">
                <option value="12.3000">Select month...</option>
                {{#months}}
                    <option value="{{month}}" {{#isEndMonth}}selected{{/isEndMonth}}>{{month}}</option>
                {{/months}}
            </select>
        </div>
        <div class="form-group">
            <label for="include-earnings-checkbox">Include Earnings?</label>
            <input type="checkbox" name="include-earnings-checkbox" id="include-earnings-checkbox"></input>
        </div>
        <div class="form-group">
            <label for="category-select">Category</label>
            <select name="category-select" id="category-select">
                <option value="">Select category...</option>
                {{#categories}}
                    <option value="{{id}}" {{#isSelected}}selected{{/isSelected}}>{{name}}</option>
                {{/categories}}
            </select>
        </div>
    </div>
</div>
`;

export default function (target: string) {

    subscribeStore("entryFilter,categories", _render);

    function _render(): void {
        const categories = retrieve("categories") ?? [];
        const entries = retrieve("entries") ?? [];
        const {startMonth, endMonth, includeEarnings} = retrieve("entryFilter") ?? {
            startMonth: "01.1970",
            endMonth: "12.3000"
        };
        const monthsSet = new Set<string>();
        entries.forEach(entry => monthsSet.add(entry.date.slice(3))); // Extract "MM.YYYY" from "DD.MM.YYYY"
        const months = Array
            .from(monthsSet)
            .map(month => {
                return {
                    month,
                    isStartMonth: month === startMonth,
                    isEndMonth: month === endMonth
                }
            });
        updateDom(target, template, {months, categories});

        if (includeEarnings) {
            dom.includeEarningsCheckbox.checked = true;
        }

        onChange(dom.startMonthSelect, onSelectChange);
        onChange(dom.endMonthSelect, onSelectChange);
        onChange(dom.includeEarningsCheckbox, onIncludeEarningsChange);
        onChange(dom.categorySelect, onCategoryChange);
    }

    function onCategoryChange(): void {
        const entryFilter = retrieve("entryFilter");
        const selectedCategoryId = dom.categorySelect.value;
        updateFilter({
            startMonth: entryFilter?.startMonth ?? "01.1970",
            endMonth: entryFilter?.endMonth ?? "12.3000",
            includeEarnings: entryFilter?.includeEarnings ?? false,
            categoryId: selectedCategoryId
        })
    }

    function onSelectChange(): void {
        const entryFilter = retrieve("entryFilter");
        const selectedStartMonth = dom.startMonthSelect.value;
        const selectedEndMonth = dom.endMonthSelect.value;
        updateFilter({
            startMonth: selectedStartMonth,
            endMonth: selectedEndMonth,
            includeEarnings: entryFilter?.includeEarnings ?? false,
            categoryId: entryFilter?.categoryId ?? ""
        })
    }

    function onIncludeEarningsChange(): void {
        const entryFilter = ensure(retrieve("entryFilter"));
        store("entryFilter", {
            ...entryFilter,
            includeEarnings: dom.includeEarningsCheckbox.checked
        });
    }

    function updateFilter(filter: EntryFilter) {
        const categories = getCategories(true);
        categories.forEach(category => {
            category.isSelected = category.id === filter.categoryId;
        })
        const entryDtos = getEntriesWithCategories(true);
        const startDate = toDate("01." + filter.startMonth);
        const endDate = toDate("31." + filter.endMonth);
        const entries = entryDtos.map(entryDto => {
            const categoryMatches = !filter.categoryId || (entryDto.category && entryDto.category.id === filter.categoryId) || (entryDto.category === undefined && filter.categoryId === "uncategorized");
            const entryDate = toDate(entryDto.date);
            const entry: EntryDto = {
                ...entryDto,
                isHidden: !categoryMatches || entryDate < startDate || entryDate > endDate,
            };
            delete entry.balanceFormatted;
            delete entry.valueFormatted;
            delete entry.category;
            return entry as Entry;
        });
        store("categories", categories);
        store("entryFilter", filter);
        store("entries", entries);
    }
}



