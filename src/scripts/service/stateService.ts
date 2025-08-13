import {retrieve, store} from "../storage.ts";

export function loadState() {
    const state = retrieve("state");
    store("state", state ?? {
        isCategoryEditModalOpen: false,
        isCategoriesModalOpen: false,
    });
}