import {retrieve, store} from "../storage.ts";
import type {Session} from "../types/Session.ts";
import {ensure, lastItem, type Optional} from "../util.ts";

export function loadSession(sessionId: string): void {
    const sessions = (retrieve("sessions") ?? []);
    sessions.forEach(session => {
        if(session.id === sessionId) {
            session.isSelected = true;
            store("entries", session.entries);
            store("categories", session.categories);
            store("entryFilter", session.entryFilter);
        } else {
            session.isSelected = false;
        }
    });
    store("sessions", sessions);
}

export function getSelectedSession(): Optional<Session> {
    const sessions = retrieve("sessions") ?? [];
    return sessions.find(session => session.isSelected);
}

export function saveSession(session: Session): void {
    const sessions = (retrieve("sessions") ?? []).filter(s => s.id !== session.id);
    sessions.push(session);
    store("sessions", sessions);
}

export function saveCurrentSession(): void {
    const currentSession: Session = {
        ...ensure(getSelectedSession()),
        entries: retrieve("entries") ?? [],
        categories: retrieve("categories") ?? [],
        entryFilter: retrieve("entryFilter") ?? {
            startMonth: "01.1970",
            endMonth: "12.3000",
            includeEarnings: false
        }
    };
    saveSession(currentSession);
}

export function addNewEmptySession(): Session {
    const sessionName = prompt("Please enter a name for your session:", "Unnamed Session") || "Unnamed Session";
    const sessions = (retrieve("sessions") ?? []);
    sessions.push({
        id: window.crypto.randomUUID(),
        name: sessionName,
        isSelected: false,
        entries: [],
        categories: [],
        entryFilter: {
            startMonth: "01.1970",
            endMonth: "12.3000",
            includeEarnings: false,
        }
    });
    store("sessions", sessions);
    return lastItem(sessions);
}