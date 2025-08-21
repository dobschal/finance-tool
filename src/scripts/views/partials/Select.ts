import { html } from '@dobschal/html.js'
import type { ObservableVariable } from '@dobschal/observable/Observable'
import type { ComputedValue } from '@dobschal/observable/Computed'
import type { Optional } from '../../lib/util'
import type { HTML } from '../../types/HTML.ts'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export default function (items: ComputedValue<Array<SelectOption>> | Array<SelectOption>, observable: ObservableVariable<Optional<string>>): HTML {
  function onChange (event: Event): void {
    observable.value = (event.target as HTMLSelectElement).value
  }

  function Option (item: SelectOption): HTML {
    return html`
            <option value="${() => item.value}"
                    ${() => item.value === observable.value ? 'selected' : ''}
                    ${item.disabled === true ? 'disabled' : ''}>
                ${() => item.label}
            </option>
        `
  }

  return html`
        <select onchange="${onChange}">
            ${() => 'map' in items ? items.map(Option) : items.value.map(Option)}
        </select>
    `
}
