// region utility functions

import Mustache from "mustache";

export type Optional<T> = T | undefined;

export type Nullable<T> = T | null;

export function ensure<T>(val: Optional<T> | Nullable<T>): T {
    if (val === null || val === undefined) {
        throw new Error('Fatal Error: Value is null or undefined.');
    }
    return val;
}

// endregion

// region event listeners
export function onSubmit(form: HTMLFormElement, callback: (event: SubmitEvent) => void): void {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        callback(event);
    });
}

export function onClick(element: Nullable<HTMLElement>, callback: (event: MouseEvent) => void): void {
    element?.addEventListener("click", (event) => {
        event.preventDefault();
        callback(event);
    });
}

export function onChange(element: HTMLInputElement | HTMLSelectElement, callback: (event: Event) => void): void {
    element.addEventListener("change", (event) => {
        callback(event);
    });
}

// endregion

// region formatting & conversion

export function formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * @param date - A date string in the format "DD.MM.YYYY"
 */
export function toDate(date: string): Date {
    const parts = date.split('.');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: ${date}. Expected format is "DD.MM.YYYY".`);
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

export function toHtmlElements(html: string): Array<Element> {
    const template = document.createElement('template');
    template.innerHTML = html.trim(); // Trim to remove any leading/trailing whitespace
    return Array.from(template.content.children);
}

export function camelCaseToKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// endregion

// region DOM manipulation

// This translates the keys into HTML element IDs and queries them.
// It returns a proxy that is querying the DOM for the element with the given ID.
// E.g. UI.importButton becomes document.querySelector("#import-button").
export function referenceDom<T>(): T & { body: HTMLBodyElement } {
    return new Proxy({}, {
        get(_, prop: string) {
            return ensure(document.querySelector<HTMLElement>("#" + camelCaseToKebabCase(prop)) ?? document.querySelector<HTMLElement>(camelCaseToKebabCase(prop)));
        },
    }) as T & { body: HTMLBodyElement };
}

export function show(element: HTMLElement): void {
    element.style.display = '';
}

export function hide(element: HTMLElement): void {
    element.style.display = 'none';
}

export function updateDom(targetId: string, template: string, data: Record<string, unknown> = {}): void {

    // remove old elements with target id data attribute
    const oldElements = document.querySelectorAll(`[data-target="${targetId}"]`);
    oldElements.forEach(element => element.remove());

    // the target is command that contains the targetId (E.g. <!--#example-view-->)
    const targetCommentNode = ensure(findComment(targetId));

    // render the template with Mustache
    const renderedHtmlString = Mustache.render(template, data);
    const renderedElements = toHtmlElements(renderedHtmlString);

    // Add the rendered elements after the target comment node
    const targetNode = ensure(targetCommentNode.parentNode);
    const nextNode = targetCommentNode.nextSibling;
    renderedElements.forEach(element => {
        element.setAttribute("data-target", targetId); // Add data-target attribute for easier identification
        targetNode.insertBefore(element, nextNode)
    });
}

function findComment(text: string, root = document.body): Optional<Node> {
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_COMMENT,
        {
            acceptNode(node) {
                return node.nodeValue?.trim() === text
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            }
        }
    );
    return walker.nextNode() ?? undefined;
}

export function showToast(message: string, type: "error" | "info" = "error", duration: number = 5000): void {
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    document.getElementById("toast-container")?.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// endregion
