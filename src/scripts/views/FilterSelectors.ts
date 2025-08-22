import { html } from '@dobschal/html.js'
import { Computed, Observable } from '@dobschal/observable'
import { entries, entryFilter } from '../store.ts'
import { bind, dateStringToMonthDisplay } from '../lib/util.ts'
import Select, { type SelectOption } from './partials/Select.ts'
import type { HTML } from '../types/HTML.ts'

export default function (): HTML {
  const startMonth = bind(entryFilter, 'startMonth')
  const endMonth = bind(entryFilter, 'endMonth')
  const selectedValueFilter = Observable('all')

  const valueFilters: Array<SelectOption> = [{
    label: 'All',
    value: 'all'
  }, {
    label: 'Earnings only',
    value: 'earnings'
  }, {
    label: 'Expenses only',
    value: 'expenses'
  }]

  selectedValueFilter.subscribe((value) => {
    entryFilter.value = {
      ...entryFilter.value,
      includeEarnings: value === 'earnings' || value === 'all',
      includeExpenses: value === 'expenses' || value === 'all'
    }
  })

  entryFilter.subscribe((val) => {
    selectedValueFilter.value = val.includeEarnings && val.includeExpenses ? 'all' : val.includeEarnings ? 'earnings' : 'expenses'
  })

  const months = Computed<Array<SelectOption>>(() => {
    const monthsSet: Array<SelectOption> = [{
      label: 'All',
      value: ''
    }]
    entries.value.forEach(entry => {
      const monthDisplay = dateStringToMonthDisplay(entry.date)
      if (monthsSet.find(month => month.label === monthDisplay) == null) {
        monthsSet.push({
          value: entry.date.substring(3), // cut off the day --> e.g. "01.1970"
          label: monthDisplay
        })
      }
    })
    return monthsSet
  })

  return html`
      <div class="form-group">
          <div class="card horizontal wide top">
              <div class="form-group">
                  <label for="start-month-select">
                      From
                      ${Select(months, startMonth)}
                  </label>
              </div>
              <div class=" form-group">
                  <label for="end-month-select">
                      Until
                      ${Select(months, endMonth)}
                  </label>
              </div>
              <div class="">
                  <label for="end-month-select">
                      Value
                      ${Select(valueFilters, selectedValueFilter)}
                  </label>
              </div>
          </div>
      </div>
  `
}
