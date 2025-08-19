import {html} from "@dobschal/html.js";
import Modal from "./Modal.ts";

export default function () {
    const modalBody = html`
        <div class="horizontal space-between">
            <h2>Test Modal</h2>
            <button class="secondary">Close</button>
        </div>
    `;
    return Modal(modalBody);
}