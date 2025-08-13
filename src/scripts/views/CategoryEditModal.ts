import {onChange, onClick, onSubmit, referenceDom, updateDom} from "../util.ts";
import {retrieve, storeProp, subscribeStore} from "../storage.ts";
import {type Category} from "../types/Category.ts";
import {saveCategory} from "../service/categoryService.ts";

export default function (target: string) {
    const template = `
        <dialog {{#isOpen}}open{{/isOpen}}>
            <form>
                <h2>Category Information</h2>
                <div class="form-group">
                    <label for="id-input">ID:</label>
                    <input type="text" id="id-input" readonly placeholder="123..." value="{{category.id}}"/>
                </div>
                <div class="form-group">
                    <label for="name-input">Name:</label>
                    <input type="text" id="name-input" value="{{category.name}}"/>
                </div>
                <div class="form-group">
                    <label for="color-input">Color:</label>
                    <select id="color-input">
                        {{#colors}}
                            <option value="{{value}}" {{#isSelected}}selected{{/isSelected}}>{{name}}</option>                        
                        {{/colors}}
                    </select>
                </div>    
                <div class="form-group">
                    <label for="exclude-category-checkbox">Exclude Category:</label>
                    <input type="checkbox" id="exclude-category-checkbox" >
                </div>           
                <div class="tabs">
                    <button type="button" {{^isTab1Selected}}class="secondary"{{/isTab1Selected}} id="select-tab1button">Easy</button>
                    <button type="button" {{#isTab1Selected}}class="secondary"{{/isTab1Selected}} id="select-tab2button">Custom</button>
                </div>
                
                <div class="form-group {{^isTab1Selected}}hidden{{/isTab1Selected}}">
                    <label for="includes-one-of-input">
                        Includes One Of (separated by comma):
                    </label>
                    <input type="text" placeholder="REWE, Globus, Edeka, Kaufland..." id="includes-one-of-input" value="{{#category.filterOptions}}{{category.filterOptions.includesOneOf}}{{/category.filterOptions}}">
                </div>
                <div class="form-group {{^isTab1Selected}}hidden{{/isTab1Selected}}">
                    <label for="includes-all-of-input">
                        Includes All Of (separated by comma):
                    </label>
                    <input type="text" placeholder="Max Mustermann, Geschenk..." id="includes-all-of-input" value="{{#category.filterOptions}}{{category.filterOptions.includesAllOf}}{{/category.filterOptions}}">
                </div>
                <div class="form-group {{#isTab1Selected}}hidden{{/isTab1Selected}}">
                    <label for="custom-filter-textarea">
                        Custom Filter:
                    </label>
                    <textarea class="code" id="custom-filter-textarea" rows="10" placeholder="// Here is some fake example. \n// This actually Javascript... 'and' and 'or' work too.\n// includesOneOf() and includes() are predefined\n\nentry.value > 0 \nand \n(\n  includesOneOf('Salary', 'Income') \n  or \n  includes('Supermarket')\n)">{{category.filter}}</textarea>
                </div>
                <div class="button-group">        
                    <button type="submit">Save Category</button>
                    <button type="button" class="secondary" id="cancel-button">Cancel</button>
                </div>
            </form>
        </dialog>  
    `;

    const dom = referenceDom<{
        cancelButton: HTMLButtonElement;
        form: HTMLFormElement
        idInput: HTMLInputElement;
        nameInput: HTMLInputElement;
        colorInput: HTMLSelectElement;
        customFilterTextarea: HTMLTextAreaElement;
        selectTab1Button: HTMLButtonElement;
        selectTab2Button: HTMLButtonElement;
        excludeCategoryCheckbox: HTMLInputElement;
        includesOneOfInput: HTMLInputElement;
        includesAllOfInput: HTMLInputElement;
    }>(target);

    const colors = [
        {value: "var(--pastel-blue-10)", name: "Blue 10"},
        {value: "var(--pastel-blue-30)", name: "Blue 30"},
        {value: "var(--pastel-green-10)", name: "Green 10"},
        {value: "var(--pastel-green-30)", name: "Green 30"},
        {value: "var(--pastel-yellow-10)", name: "Yellow 10"},
        {value: "var(--pastel-yellow-30)", name: "Yellow 30"},
        {value: "var(--pastel-pink-10)", name: "Pink 10"},
        {value: "var(--pastel-pink-30)", name: "Pink 30"},
        {value: "var(--pastel-purple-10)", name: "Purple 10"},
        {value: "var(--pastel-purple-30)", name: "Purple 30"},
        {value: "var(--pastel-orange-10)", name: "Orange 10"},
        {value: "var(--pastel-orange-30)", name: "Orange 30"},
        {value: "var(--pastel-red-10)", name: "Red 10"},
        {value: "var(--pastel-red-30)", name: "Red 30"},
        {value: "var(--grey-10)", name: "Grey 10"},
        {value: "var(--grey-30)", name: "Grey 30"}
    ];
    let isOpen = false;
    let category: Category = getEmptyCategory();
    let selectedTab = 1;

    // We need to subscribe those separately to avoid ugly side effects on render
    subscribeStore("state", () => {
        isOpen = retrieve("state")?.isCategoryEditModalOpen ?? false;
        render();
    });

    subscribeStore("categories", () => {
        category = (retrieve("categories") ?? []).find(c => c.isSelectedForEdit) ?? getEmptyCategory();
        render();
    });

    function render() {
        updateDom(target, template, {
            category,
            isOpen,
            isTab1Selected: selectedTab === 1,
            colors: colors.map(c => ({...c, isSelected: category.color === c.value}))
        });
        dom.excludeCategoryCheckbox.checked = category.isExcluded ?? false;
        applyEventListeners();
    }

    function applyEventListeners() {

        onClick(dom.cancelButton, close);

        onChange(dom.excludeCategoryCheckbox, () => {
            category.isExcluded = !category.isExcluded;
        });

        onSubmit(dom.form, () => {
            const id = dom.idInput.value.trim() || window.crypto.randomUUID();
            const name = dom.nameInput.value.trim();
            const color = dom.colorInput.value.trim();
            const filter = dom.customFilterTextarea.value.trim();
            const isExcluded = dom.excludeCategoryCheckbox.checked;
            const includesOneOf = dom.includesOneOfInput.value.trim();
            const includesAllOf = dom.includesAllOfInput.value.trim();
            if (!id || !name || !color || !(filter || includesOneOf || includesAllOf)) {
                alert("Please fill in all fields.");
                return;
            }
            saveCategory({
                id,
                name,
                color,
                filter,
                isExcluded,
                filterOptions: {
                    includesAllOf: includesAllOf.split(",").map(c => c.trim()),
                    includesOneOf: includesOneOf.split(",").map(c => c.trim()),
                }
            });
            close();
        });

        onClick(dom.selectTab1Button, () => {
            selectedTab = 1;
            render();
        });

        onClick(dom.selectTab2Button, () => {
            selectedTab = 2;
            render();
        });
    }

    function getEmptyCategory(): Category {
        return {
            id: window.crypto.randomUUID(),
            name: "",
            filter: "",
            color: "var(--pastel-blue-10)",
        };
    }

    function close() {
        storeProp("state", "isCategoryEditModalOpen", false);
        storeProp("state", "isCategoriesModalOpen", true);
    }
}