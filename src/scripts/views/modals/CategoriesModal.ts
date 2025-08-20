import {categories, entries, state} from "../../store.ts";
import {html} from "@dobschal/html.js";
import type {CategoryDto} from "../../types/Category.ts";
import {getCategories} from "../../service/categoryService.ts";
import Modal from "./Modal.ts";
import {bind} from "../../lib/util.ts";

export default function () {

    const isOpen = bind(state, "isCategoriesModalOpen");

    function onAddCategoryModal() {
        categories.value.forEach(c => c.isSelectedForEdit = false);
        close();
        state.value.isCategoryEditModalOpen = true;
    }

    function close() {
        state.value.isCategoriesModalOpen = false;
    }

    return Modal(isOpen, "Categories", html`
        <p class="alert info">
            For ${entries.value.length} entries, ${categories.value.length} categories are defined.
        </p>
        <ul>
            ${() => getCategories().map(ListItem)}
        </ul>
        <div class="button-group">
            <button onclick="${onAddCategoryModal}">Add Category</button>
            <button onclick="${close}" class="secondary">Close</button>
        </div>
    `);
}

function ListItem({name, color, averageBalancePerMonth, totalBalanceFormatted, id}: CategoryDto) {

    function editCategory(): void {
        categories.value.forEach(c => c.isSelectedForEdit = c.id === id);
        state.value.isCategoriesModalOpen = false;
        state.value.isCategoryEditModalOpen = true;
    }

    function deleteCategory(event: MouseEvent): void {
        event.stopPropagation();
        if (!confirm("Are you sure you want to delete this category?")) {
            return;
        }
        categories.value = categories.value.filter(category => category.id !== id);
    }

    return html`
        <li style="background-color: ${color};" onclick="${editCategory}">
            <span style="width: 100%;">${name}</span>
            <span style="width: 200px; text-align: right">
                    ${averageBalancePerMonth}<br> 
                    <small>per Month (⌀)</small>
                </span>
            <span style="width: 200px; text-align: right">
                    ${() => totalBalanceFormatted}<br> 
                    <small>Total</small>
                </span>
            <svg onclick="${deleteCategory}" style="width: 3rem; height: 3rem;" xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-button delete">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
            </svg>
        </li>
    `;
}
