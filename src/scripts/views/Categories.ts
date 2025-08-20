import {getCategories} from "../service/categoryService.ts";
import {html} from "@dobschal/html.js";
import type {CategoryDto} from "../types/Category.ts";
import {entryFilter, state} from "../store.ts";
import {Computed} from "@dobschal/observable";
import Checkbox from "./partials/Checkbox.ts";
import {bind} from "../lib/util.ts";

export default function () {

    const isAverageShown = bind(state, "isAverageShown");

    function openModal() {
        state.value.isCategoriesModalOpen = true;
        state.value.isCategoryEditModalOpen = false;
    }

    function openAddCategoryModal(): void {
        state.value.isCategoriesModalOpen = false;
        state.value.isCategoryEditModalOpen = true;
    }

    return html`
        <div class="card">
            <div class="horizontal space-between">
                <h2>Categories</h2>
                <div class="horizontal wide">
                    <label>
                        ${Checkbox(isAverageShown)}
                        Show Average<br> Per Month?
                    </label>
                    <button class="secondary" onclick="${openModal}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/>
                        </svg>
                        Edit
                    </button>
                </div>
            </div>
            <div class="horizontal">

                ${() => getCategories().filter(c => !c.isExcluded).map(CategoryCircleBadge)}

                <div onclick="${openAddCategoryModal}" class="circle-badge"
                     style="background-color: #ffffff; border-color: rgba(0,0,0,0.1); border-style: dotted; border-width: 4px">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    <span>Add Category</span>
                </div>
            </div>
        </div>
    `;
}

function CategoryCircleBadge(c: CategoryDto) {

    const isHiddenCategory = Computed(() => entryFilter.value.hiddenCategories.includes(c.id));

    function onClick() {
        const hiddenCategories = entryFilter.value.hiddenCategories;
        if (hiddenCategories.includes(c.id)) {
            hiddenCategories.splice(hiddenCategories.indexOf(c.id), 1);
        } else {
            hiddenCategories.push(c.id);
        }
        entryFilter.value = {
            ...entryFilter.value,
            hiddenCategories
        };
    }

    return html`
        <div onclick="${onClick}" class="circle-badge"
             style="background-color: ${c.color}; border-color: rgba(0,0,0,0.1); opacity: ${() => isHiddenCategory.value ? 0.2 : 1}">
            <span>${c.name}</span>
            <b>${() => state.value.isAverageShown ? c.averageBalancePerMonth : c.totalBalanceFormatted}</b>
            <small>${() => state.value.isAverageShown ? "per Month" : "Total"}
                    (${() => state.value.isAverageShown ? Math.round(c.averageAmountPerMonth) : c.amountOfEntries}
                    )</small>
        </div>
    `;
}
