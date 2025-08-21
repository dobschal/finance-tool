import { persist } from './lib/persist.ts'
import type { Category } from './types/Category.ts'
import type { ApplicationState } from './types/ApplicationState.ts'
import type { Entry } from './types/Entry.ts'
import type { Session } from './types/Session.ts'
import type { EntryFilter } from './types/EntryFilter.ts'
import { addNewEmptySession, loadSession } from './service/sessionService.ts'

export const entryFilter = persist<EntryFilter>('entryFilter', {
  startMonth: '01.1970',
  endMonth: '12.3000',
  includeEarnings: false,
  hiddenCategories: []
})

export const categories = persist<Array<Category>>('categories', [])

export const entries = persist<Array<Entry>>('entries', [])

export const sessions = persist<Array<Session>>('sessions', [])

export const state = persist<ApplicationState>('state', {
  isCategoriesModalOpen: false,
  isCategoryEditModalOpen: false,
  isImportModalOpen: false,
  sessionId: sessions.value[0]?.id,
  isAverageShown: false
})

// Add default session if none exist
sessions.subscribe((sessions) => {
  if (sessions.length === 0) {
    const session = addNewEmptySession()
    loadSession(session.id)
  }
})
