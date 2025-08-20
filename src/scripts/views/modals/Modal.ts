import {html} from "@dobschal/html.js";
import type {ObservableVariable} from "@dobschal/observable/Observable";
import {onMounted, onRemoved} from "../../lib/domObserver.ts";

export default function (isOpen: ObservableVariable<boolean>, title: string, content: unknown) {

    const element = html`
        <dialog ${() => isOpen.value ? "open" : ""}>
            <div class="horizontal space-between">
                <h2>${title}</h2>
                <svg onclick="${close}" class="icon-button" xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
                </svg>
            </div>
            ${content}
        </dialog
    ` as ChildNode;

    onMounted(element, () => {
        document.addEventListener("keydown", catchEscapePress);
        element.addEventListener("mousedown", onMouseDown);
    });

    onRemoved(element, () => {
        document.removeEventListener("keydown", catchEscapePress);
        element.removeEventListener("mousedown", onMouseDown);
    });

    return element;

    function close() {
        isOpen.value = false;
    }

    function catchEscapePress(e: KeyboardEvent) {
        if (e.key === "Escape") {
            console.log("Pressed escape to close modal");
            close();
        }
    }

    function onMouseDown(event: Event) {
        if (event.target !== element) return;
        event.stopPropagation();
        let x = (event as MouseEvent).clientX;
        let y = (event as MouseEvent).clientY;
        let dialog = element as HTMLDialogElement;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        function onMouseMove(event: Event) {
            let dx = (event as MouseEvent).clientX - x;
            let dy = (event as MouseEvent).clientY - y;
            dialog.style.left = (dialog.offsetLeft + dx) + "px";
            dialog.style.top = (dialog.offsetTop + dy) + "px";
            x = (event as MouseEvent).clientX;
            y = (event as MouseEvent).clientY;
        }
    }
}