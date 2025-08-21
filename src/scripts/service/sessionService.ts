import { categories, entries, entryFilter, sessions, state } from '../store.ts'
import type { Session } from '../types/Session.ts'
import { ensure, lastItem, type Optional } from '../lib/util.ts'

export function loadSession (sessionId: string): void {
  if (state.value.sessionId === sessionId) return
  const session = ensure(sessions.value.find(session => session.id === sessionId))
  entries.value = session.entries
  categories.value = session.categories
  entryFilter.value = session.entryFilter
  state.value.sessionId = session.id
}

export function getSelectedSession (): Optional<Session> {
  return sessions.value.find(session => session.id === state.value.sessionId)
}

export function saveSession (session: Session): void {
  sessions.value = sessions.value
    .filter(s => s.id !== session.id)
    .concat([session])
}

export function addNewEmptySession (): Session {
  const sessionName = prompt('Please enter a name for your session:', 'Unnamed Session') ?? 'Unnamed Session'
  sessions.value.push({
    id: window.crypto.randomUUID(),
    name: sessionName,
    entries: [],
    categories: [],
    entryFilter: {
      startMonth: '01.1970',
      endMonth: '12.3000',
      includeEarnings: false,
      hiddenCategories: []
    }
  })
  return lastItem(sessions.value)
}
