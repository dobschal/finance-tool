import {onClick, referenceDom, updateDom} from "../util.ts";
import {retrieve, store, storeProp, subscribeStore} from "../storage.ts";
import type {Category} from "../types/Category.ts";
import {getCategories} from "../service/categoryService.ts";
import {getEntriesWithCategories} from "../service/entryService.ts";

const dom = referenceDom<{
    categoriesModalCloseButton: HTMLButtonElement;
    categoryEditButton: HTMLButtonElement;
    categoryEditModal: HTMLDialogElement;
}>();

const template = `
    <dialog {{#isOpen}}open{{/isOpen}}>        
        <div class="vertical">
            <h2>Categories</h2>   
            <p class="alert info">
                For {{entries.length}} entries, {{categories.length}} categories are defined.
            </p>     
            <ul>
                {{#categories}}
                    <li id="{{id}}" style="background-color: {{color}};">
                        <span style="width: 100%;">{{name}}</span>                    
                        <span style="width: 200px; text-align: right">
                            {{averageBalancePerMonth}}<br> 
                            <small>per Month (⌀)</small>
                        </span>
                        <span style="width: 200px; text-align: right">
                            {{totalBalanceFormatted}}<br> 
                            <small>Total</small>
                        </span>
                        <svg style="width: 3rem; height: 3rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-button delete"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    </li>
                {{/categories}}
            </ul>
            <div class="button-group">
                <button id="category-edit-button">Add Category</button>
                <button id="categories-modal-close-button" class="secondary">Close</button>
            </div>
        </div>
    </dialog>
`;

export default function (target: string): void {
    subscribeStore("categories, state", render);

    function render(): void {
        const entries = getEntriesWithCategories(true);
        const categories = getCategories(true);
        const state = retrieve("state");

        updateDom(target, template, {
            categories,
            entries,
            isOpen: state?.isCategoriesModalOpen
        });

        applyEventListeners(categories);
    }

    function applyEventListeners(categories: Array<Category>): void {
        onClick(dom.categoryEditButton, () => {
            categories.forEach(c => c.isSelectedForEdit = false);
            store("categories", categories);
            storeProp("state", "isCategoriesModalOpen", false);
            storeProp("state", "isCategoryEditModalOpen", true);
        });

        onClick(dom.categoriesModalCloseButton, () => {
            storeProp("state", "isCategoriesModalOpen", false);
        });

        categories.forEach(category => {
            onClick(document.getElementById(category.id), (event) => {
                const isDeleteButton = (event.target as HTMLElement)?.classList.contains("delete");
                if (isDeleteButton) {
                    return handleDeleteCategory(category.id);
                }
                handleCategoryEdit(category);
            });
        });
    }

    function handleCategoryEdit(category: Category): void {
        const categories = getCategories(true);
        categories.forEach(c => c.isSelectedForEdit = c.id === category.id);
        store("categories", categories);
        storeProp("state", "isCategoriesModalOpen", false);
        storeProp("state", "isCategoryEditModalOpen", true);
    }

    function handleDeleteCategory(categoryId: string): void {
        if (!confirm("Are you sure you want to delete this category?")) {
            return;
        }
        const categories = retrieve("categories") ?? [];
        const updatedCategories = categories.filter(category => category.id !== categoryId);
        store("categories", updatedCategories);
    }

}
