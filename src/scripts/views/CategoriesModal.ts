import {hide, onClick, onSubmit, referenceDom, show, updateDom} from "../util.ts";
import {retrieve, store, subscribeStore} from "../storage.ts";
import type {Category} from "../types/Category.ts";
import {getCategories} from "../service/categoryService.ts";
import {getEntriesWithCategories} from "../service/entryService.ts";

const dom = referenceDom<{
    categoriesModal: HTMLDialogElement;
    categoriesModalCloseButton: HTMLButtonElement;
    categoriesModalListView: HTMLDivElement;
    editCategoryButton: HTMLButtonElement;
    editCategoryModalForm: HTMLFormElement;
    editCategoryIdInput: HTMLInputElement;
    editCategoryNameInput: HTMLInputElement;
    editCategoryColorInput: HTMLInputElement;
    editCategoryFilterInput: HTMLTextAreaElement;
    editCategoryCancelButton: HTMLButtonElement;
}>();

const template = `
    <dialog id="categories-modal">        
        <div id="categories-modal-list-view" class="vertical">
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
                <button id="edit-category-button">Add Category</button>
                <button id="categories-modal-close-button" class="secondary">Close</button>
            </div>
        </div>
        <form id="edit-category-modal-form" style="display: none;">
            <h2>Category Information</h2>
            <div class="form-group">
                <label for="edit-category-id-input">ID:</label>
                <input type="text" id="edit-category-id-input" readonly placeholder="123..."/>
            </div>
            <div class="form-group">
                <label for="edit-category-name-input">Name:</label>
                <input type="text" id="edit-category-name-input"/>
            </div>
            <div class="form-group">
                <label for="edit-category-color-input">Color:</label>
                <select id="edit-category-color-input">
                    <option value="var(--pastel-blue-10)">Blue 10</option>
                    <option value="var(--pastel-blue-30)">Blue 30</option>
                    <option value="var(--pastel-green-10)">Green 10</option>
                    <option value="var(--pastel-green-30)">Green 30</option>
                    <option value="var(--pastel-yellow-10)">Yellow 10</option>
                    <option value="var(--pastel-yellow-30)">Yellow 30</option>
                    <option value="var(--pastel-pink-10)">Pink 10</option>
                    <option value="var(--pastel-pink-30)">Pink 30</option>
                    <option value="var(--pastel-purple-10)">Purple 10</option>
                    <option value="var(--pastel-purple-30)">Purple 30</option>                
                    <option value="var(--pastel-orange-10)">Orange 10</option>
                    <option value="var(--pastel-orange-30)">Orange 30</option>
                    <option value="var(--pastel-red-10)">Red 10</option>
                    <option value="var(--pastel-red-30)">Red 30</option>
                    <option value="var(--grey-10)">Grey 10</option>
                    <option value="var(--grey-30)">Grey 30</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-category-filter-input">
                    Filter:
                </label>
                <textarea class="code" id="edit-category-filter-input" rows="10" placeholder="// Here is some fake example. \n// This actually Javascript... 'and' and 'or' work too.\n// includesOneOf() and includes() are predefined\n\nentry.value > 0 \nand \n(\n  includesOneOf('Salary', 'Income') \n  or \n  includes('Supermarket')\n)"></textarea>
            </div>
            <div class="button-group">        
                <button type="submit">Save Category</button>
                <button type="button" class="secondary" id="edit-category-cancel-button">Cancel</button>
            </div>
        </form>
    </dialog>
`;

export default function (target: string): void {
    subscribeStore("categories", _render);

    function _render(): void {
        const entries = getEntriesWithCategories(true);
        const categories = getCategories(true);

        updateDom(target, template, {
            categories,
            entries,
        });

        applyEventListeners(categories);
    }

    function applyEventListeners(categories: Array<Category>): void {
        onClick(dom.editCategoryButton, () => {
            dom.editCategoryModalForm.reset();
            show(dom.editCategoryModalForm);
            hide(dom.categoriesModalListView);
        });

        onClick(dom.editCategoryCancelButton, () => {
            hide(dom.editCategoryModalForm);
            show(dom.categoriesModalListView);
        });

        onClick(dom.categoriesModalCloseButton, () => {
            dom.categoriesModal.close();
        });

        categories.forEach(category => {
            onClick(document.getElementById(category.id), (event) => {
                const isDeleteButton = (event.target as HTMLElement)?.classList.contains("delete");
                if (isDeleteButton) {
                    return handleDeleteCategory(category.id);
                }
                handleEditCategory(category);
            });
        });

        onSubmit(dom.editCategoryModalForm, () => {
            const id = dom.editCategoryIdInput.value.trim() || window.crypto.randomUUID();
            const name = dom.editCategoryNameInput.value.trim();
            const color = dom.editCategoryColorInput.value.trim();
            const filter = dom.editCategoryFilterInput.value.trim();

            if (!name || !color || !filter) {
                alert("Please fill in all fields.");
                return;
            }

            let categories = retrieve("categories") ?? [];
            categories = categories.filter(category => category.id !== id);
            categories.push({
                id,
                name,
                color,
                filter
            });
            store("categories", categories);

            hide(dom.editCategoryModalForm);
            show(dom.categoriesModalListView);
        });
    }

    function handleEditCategory(category: Category): void {
        dom.editCategoryNameInput.value = category.name;
        dom.editCategoryColorInput.value = category.color;
        dom.editCategoryFilterInput.value = category.filter;
        dom.editCategoryIdInput.value = category.id;
        show(dom.editCategoryModalForm);
        hide(dom.categoriesModalListView);
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
