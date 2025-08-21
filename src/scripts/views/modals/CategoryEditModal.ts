import { html } from '@dobschal/html.js'
import { categories, state } from '../../store.ts'
import { Observable } from '@dobschal/observable'
import { type SelectOption } from '../partials/Select.ts'
import { bind, toArray } from '../../lib/util.ts'
import Checkbox from '../partials/Checkbox.ts'
import Modal from './Modal.ts'

export default function (): ChildNode {
  const colors: Array<SelectOption> = [
    {
      value: 'var(--row-color-1)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-2)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-3)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-4)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-5)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-6)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-7)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-8)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-9)',
      label: 'Default'
    },
    {
      value: 'var(--row-color-10)',
      label: 'Default'
    }
  ]

  const isOpen = bind(state, 'isCategoryEditModalOpen')
  const id = Observable('')
  const name = Observable('')
  const color = Observable('')
  const filter = Observable('')
  const includesOneOf = Observable('')
  const includesAllOf = Observable('')
  const isExcluded = Observable(false)
  const shownTab = Observable(1)

  state.subscribe((state) => {
    if (!state.isCategoryEditModalOpen) return
    const category = categories.value.find(c => c.isSelectedForEdit)
    if (category == null) {
      setEmptyCategory()
    } else {
      id.value = category.id
      name.value = category.name
      color.value = category.color
      filter.value = category.filter
      includesAllOf.value = category.filterOptions.includesAllOf?.join(', ') ?? ''
      includesOneOf.value = category.filterOptions.includesOneOf?.join(', ') ?? ''
      isExcluded.value = category.isExcluded ?? false
    }
  })

  function onSubmit (event: SubmitEvent): void {
    event.preventDefault()
    if (!id.value || !name.value || !color.value || !(filter.value || includesOneOf.value || includesAllOf.value)) {
      alert('Please fill in all fields.')
      return
    }
    categories.value = categories.value.filter(c => c.id !== id.value)
    categories.value.push({
      id: id.value,
      name: name.value,
      color: color.value,
      filter: filter.value,
      isExcluded: isExcluded.value,
      filterOptions: {
        includesOneOf: toArray(includesOneOf.value),
        includesAllOf: toArray(includesAllOf.value)
      }
    })
    close()
  }

  function setEmptyCategory (): void {
    id.value = window.crypto.randomUUID()
    name.value = ''
    color.value = colors[0].value
    filter.value = ''
    includesAllOf.value = ''
    includesOneOf.value = ''
    isExcluded.value = false
  }

  function close (): void {
    state.value.isCategoryEditModalOpen = false
    state.value.isCategoriesModalOpen = true
  }

  return Modal(isOpen, 'Category Information', html`
      <form onsubmit="${onSubmit}">
          <div class="form-group">
              <label for="name-input">Name:</label>
              <input type="text" value="${name}"/>
          </div>
          <div class="form-group">
              <label for="color-input">Color:</label>
              <div class="horizontal tight wrap">
                  ${() => colors.map(c => html`
                      <div onclick="${() => (color.value = c.value)}"
                           class="color-circle ${color.value === c.value ? 'selected' : ''}"
                           style="background-color: ${() => c.value}">
                  `)}
              </div>
          </div>
          <div class="form-group">
              <label for="exclude-category-checkbox">Exclude Category:</label>
              ${Checkbox(isExcluded)}
          </div>
          <div class="tabs">
              <button type="button"
                      class="${() => shownTab.value !== 1 ? 'secondary' : 'primary'}"
                      onclick="${() => (shownTab.value = 1)}">
                  Easy
              </button>
              <button type="button"
                      class="${() => shownTab.value !== 2 ? 'secondary' : 'primary'}"
                      onclick="${() => (shownTab.value = 2)}">
                  Custom
              </button>
          </div>

          <div class="form-group ${() => shownTab.value !== 1 ? 'hidden' : 'shown'}">
              <label for="includes-one-of-input">
                  Includes One Of (separated by comma):
              </label>
              <input type="text"
                     placeholder="REWE, Globus, Edeka, Kaufland..."
                     value="${includesOneOf}">
          </div>
          <div class="form-group ${() => shownTab.value !== 1 ? 'hidden' : 'shown'}">
              <label for="includes-all-of-input">
                  Includes All Of (separated by comma):
              </label>
              <input type="text"
                     placeholder="Max Mustermann, Geschenk..."
                     value="${includesAllOf}">
          </div>
          <div class="form-group ${() => shownTab.value !== 2 ? 'hidden' : 'shown'}">
              <label for="custom-filter-textarea">
                  Custom Filter:
              </label>
              <textarea class="code"
                        rows="12"
                        value="${filter}"
                        placeholder="Custom JavaScript code to filter entries...">
                </textarea>
          </div>
          <div class="button-group">
              <button type="submit">Save Category</button>
              <button type="button" class="secondary" onclick="${close}">Cancel</button>
          </div>
      </form>
  `)
}
