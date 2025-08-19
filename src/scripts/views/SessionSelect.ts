import {ensure, type Optional} from "../lib/util.ts";
import {isSession, type Session} from "../types/Session.ts";
import {addNewEmptySession, getSelectedSession, loadSession, saveSession} from "../service/sessionService.ts";
import {html} from "@dobschal/html.js";
import {categories, entries, entryFilter, sessions, state} from "../store.ts";
import {Computed, Observable} from "@dobschal/observable";
import Select, {type SelectOption} from "./partials/Select.ts";
import {showToast} from "../lib/toast.ts";

export default function () {

    const options = Computed(() => prepareOptions(sessions.value));
    const selectedOptionValue = Observable(state.value.sessionId);

    state.subscribe((state) => {
        selectedOptionValue.value = state.sessionId;
    });

    function prepareOptions(sessions: Array<Session>): Array<SelectOption> {
        const options: Array<SelectOption> = sessions.map((session) => ({
            value: session.id,
            label: session.name
        }));
        options.push({
            value: "",
            label: "",
            disabled: true
        });
        options.push({
            value: "add-new-session",
            label: "➕ Add New Session"
        });
        options.push({
            value: "import-session",
            label: "💾 Import Session"
        });
        return options;
    }

    selectedOptionValue.subscribe(async val => {
        if (!val) return;
        const currentSession = ensure(getSelectedSession());
        saveSession({
            id: currentSession.id,
            name: currentSession.name,
            entries: entries.value,
            categories: categories.value,
            entryFilter: entryFilter.value
        });
        switch (val) {
            case "import-session":
                const session = await importSession();
                if (session) {
                    loadSession(session.id);
                }
                break;
            case "add-new-session":
                loadSession(addNewEmptySession().id);
                break;
            default:
                loadSession(val);

        }
    });

    function importSession(): Promise<Optional<Session>> {
        return new Promise(resolve => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = async (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const session: unknown = JSON.parse(text);
                    if (!session || !isSession(session)) {
                        console.error("Imported session fail is invalid: ", session);
                        showToast("The imported file is invalid.");
                        resolve(undefined);
                        return;
                    }
                    saveSession(session);
                    resolve(session);
                } catch (error) {
                    console.error("Failed to parse session data:", error);
                    alert("Failed to upload session data. Please ensure the file is in the correct format.");
                    resolve(undefined);
                }
            };
            input.click();
        })
    }

    return html`
        ${Select(options, selectedOptionValue)}
    `
}
