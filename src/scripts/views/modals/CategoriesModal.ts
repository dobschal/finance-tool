import { categories, entries, state } from '../../store.ts'
import { html } from '@dobschal/html.js'
import type { CategoryDto } from '../../types/Category.ts'
import { getCategories } from '../../service/categoryService.ts'
import Modal from './Modal.ts'
import { bind } from '../../lib/util.ts'
import type { HTML } from '../../types/HTML.ts'

export default function (): ChildNode {
  const isOpen = bind(state, 'isCategoriesModalOpen')

  function onAddCategoryModal (): void {
    categories.value.forEach(c => (c.isSelectedForEdit = false))
    close()
    state.value.isCategoryEditModalOpen = true
  }

  function close (): void {
    state.value.isCategoriesModalOpen = false
  }

  return Modal(isOpen, 'Categories', html`
      <p class="alert info">
          For ${entries.value.length} entries, ${categories.value.length} categories are defined.
      </p>
      <div class="horizontal">
          <ul>
              ${() => getCategories().map(ListItem)}
          </ul>
      </div>
      <div class="button-group">
          <button onclick="${onAddCategoryModal}">Add Category</button>
          <button onclick="${close}" class="secondary">Close</button>
      </div>
  `)
}

/* <<<<<<<<<<<<<<  ✨ Windsurf Command ⭐ >>>>>>>>>>>>>>>> */
/**
 * Creates a list item for a category.
 *
 * @param name The name of the category.
 * @param color The color of the category.
 * @param averageBalancePerMonth The average balance of the category per month.
 * @param totalBalanceFormatted The total balance of the category formatted as a string.
 * @param id The id of the category.
 * @returns A list item element.
 */

/* <<<<<<<<<<  793eecde-76f4-4f55-8c24-f3d91c93ab0a  >>>>>>>>>>> */
function ListItem ({
  name,
  color,
  averageBalancePerMonth,
  totalBalanceFormatted,
  id
}: CategoryDto): HTML {
  function editCategory (): void {
    categories.value.forEach(c => (c.isSelectedForEdit = c.id === id))
    state.value.isCategoriesModalOpen = false
    state.value.isCategoryEditModalOpen = true
  }

  function deleteCategory (event: MouseEvent): void {
    event.stopPropagation()
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }
    categories.value = categories.value.filter(category => category.id !== id)
  }

  return html`
      <li style="background-color: ${color};" onclick="${editCategory}">
          <span style="width: 100%;">${name}</span>
          <span style="width: 200px; text-align: right">
                    ${averageBalancePerMonth}<br> 
                    <small>per Month (⌀)</small>
                </span>
          <span style="width: 200px; text-align: right">
                    ${() => totalBalanceFormatted}<br> 
                    <small>Total</small>
                </span>
          <svg onclick="${deleteCategory}" style="width: 3rem; height: 3rem;" xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-button delete">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
          </svg>
      </li>
  `
}
