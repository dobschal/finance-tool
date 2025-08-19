import {html} from "@dobschal/html.js";

export default function (content: unknown) {
    return html`
        <dialog open>
            <div class="horizontal">
                <h2>Something</h2>
                <button class="secondary">Close</button>
            </div>
            ${content}
        </dialog
    `;
}