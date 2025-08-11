import {onClick, referenceDom, updateDom} from "../util.ts";

const template = `
    <button class="secondary" id="categories-button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
             stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/>
        </svg>
        Categories
    </button>
`;

const dom = referenceDom<{
    categoriesButton: HTMLElement;
    categoriesModal: HTMLDialogElement;
}>();

export default function (target: string) {
    updateDom(target, template);

    onClick(dom.categoriesButton, () => {
        dom.categoriesModal.showModal();
    });
}
