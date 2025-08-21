import { html } from '@dobschal/html.js'
import type { ObservableVariable } from '@dobschal/observable/Observable'

export default function (observable: ObservableVariable<boolean>): HTMLInputElement {
  function onChange (event: Event): void {
    const element = event.target as HTMLInputElement
    observable.value = element.checked
  }

  const element = html`
        <input type="checkbox" onchange="${onChange}">
    ` as HTMLInputElement

  observable.subscribe((val: boolean) => {
    element.checked = val
  })

  return element
}
