import { html } from '@dobschal/html.js'
import type { EntryDto } from '../types/Entry.ts'
import { getEntriesWithCategories, getFilteredEntriesWithCategories } from '../service/entryService.ts'
import { Computed } from '@dobschal/observable'
import { entryFilter } from '../store.ts'
import type { HTML } from '../types/HTML.ts'

export default function (): HTML {
  const entries = Computed(() => getEntriesWithCategories())
  const filteredEntries = Computed(() => getFilteredEntriesWithCategories().filter(entry => {
    if (entryFilter.value.hiddenCategories.includes('uncategorized') && (entry.category == null)) {
      return false
    } else if (entry.category?.id && entryFilter.value.hiddenCategories.includes(entry.category.id)) {
      return false
    }
    return true
  }))

  return html`
        <div class="card">
            <div class="horizontal space-between">
                <h2>Entries</h2>
                <small>

                    ${() => filteredEntries.value.length}
                    of
                    ${() => entries.value.length} entries
                </small>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Recipient/Sender</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th class="number">Value</th>
                </tr>
                </thead>
                <tbody>
                ${() => filteredEntries.value.map(TableEntry)}
                </tbody>
            </table>
        </div>
    `
}

function TableEntry (entry: EntryDto): HTML {
  const style = Computed(() => {
    if (!entry.category?.color) return ''
    return `background-color: ${entry.category.color}`
  })

  return html`
        <tr style="${style}">
            <td class="date">${entry.date}</td>
            <td class="recipient">${entry.recipientSender}</td>
            <td class="type">${entry.type}</td>
            <td class="description">${entry.description}</td>
            <td class="value number">${entry.valueFormatted}</td>
        </tr>
    `
}
