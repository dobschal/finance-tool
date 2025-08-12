import {ensure, onClick, referenceDom, updateDom} from "../util.ts";
import {clear, retrieve, store} from "../storage.ts";
import {getSelectedSession, loadSession, saveSession} from "../service/sessionService.ts";



export default function (target: string) {

    const template = `
        <svg id="edit-button" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-button">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
        <svg id="delete-button" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-button">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
        <svg id="download-button" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" class="icon-button">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
        </svg>    
    `;

    const dom = referenceDom<{
        downloadButton: HTMLElement;
        deleteButton: HTMLElement;
        editButton: HTMLElement;
    }>(target);

    updateDom(target, template);

    onClick(dom.editButton, () => {
        const session = ensure(getSelectedSession());
        const newSessionName = prompt("Change session name:", session?.name);
        if(!newSessionName) {
            return;
        }
        session.name = newSessionName;
        saveSession(session);
    })

    onClick(dom.deleteButton, () => {
        if (!confirm("Are you sure you want to delete this session? This cannot be undone.")) {
            return;
        }
        clear("entries", "categories", "entryFilter");
        const sessions = retrieve("sessions") ?? [];
        const index = sessions.findIndex(session => session.isSelected);
        if (index > -1) {
            sessions.splice(index, 1);
        }
        store("sessions", sessions);
        if(sessions.length === 0) {
            window.location.reload();
        } else {
            loadSession(sessions[0].id);
        }
    });

    onClick(dom.downloadButton, () => {
        const sessionData = ensure(getSelectedSession());
        sessionData.isSelected = false;
        const blob = new Blob([JSON.stringify(sessionData)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financial_tool_session_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}
