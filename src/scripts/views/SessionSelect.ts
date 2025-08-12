import {onChange, type Optional, referenceDom, updateDom} from "../util.ts";
import {retrieve, subscribeStore} from "../storage.ts";
import {isSession, type Session} from "../types/Session.ts";
import {addNewEmptySession, loadSession, saveCurrentSession, saveSession} from "../service/sessionService.ts";

interface Option {
    id: string;
    name: string;
    disabled?: boolean;
    selected?: boolean;
}

export default function(target: string) {

    const template = `
        <select>
            {{#options}}
                <option value="{{id}}" {{#selected}}selected{{/selected}} {{#disabled}}disabled{{/disabled}}>{{name}}</option>
            {{/options}}
        </select>
    `;

    const dom = referenceDom<{
        select: HTMLSelectElement
    }>(target);

    subscribeStore("sessions", render);

    function render() {
        const sessions = retrieve("sessions") ?? [];
        if(sessions.length === 0) {
            addNewEmptySession();
        }
        const options = prepareOptions(sessions);
        updateDom(target, template, { options });
        applyEventListeners();
    }

    function prepareOptions(sessions: Array<Session>): Array<Option> {
        const options: Array<Option> = sessions.map((session) => ({
            id: session.id,
            name: session.name,
            selected: session.isSelected
        }));
        options.push({
            id: "",
            name: "",
            disabled: true
        });
        options.push({
            id: "add-new-session",
            name: "➕ Add New Session"
        });
        options.push({
            id: "import-session",
            name: "💾 Import Session"
        });
        return options;
    }

    function applyEventListeners() {
        onChange(dom.select, async () => {
            saveCurrentSession();
            switch(dom.select.value) {
                case "import-session":
                    const session = await importSession();
                    if(session) {
                        loadSession(session.id);
                    }
                    break;
                case "add-new-session":
                    loadSession(addNewEmptySession().id);
                    break;
                default:
                    loadSession(dom.select.value);

            }
        });
    }

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
                    if(!session || !isSession(session)) {
                        console.error("Imported session fail is invalid: ", session);
                        alert("The imported file is invalid.");
                        resolve();
                        return;
                    }
                    saveSession(session);
                    resolve(session);
                } catch (error) {
                    console.error("Failed to parse session data:", error);
                    alert("Failed to upload session data. Please ensure the file is in the correct format.");
                    resolve();
                }
            };
            input.click();
        })
    }
}