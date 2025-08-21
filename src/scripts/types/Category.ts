export interface Category {
  id: string
  color: string
  name: string
  filter: string
  filterOptions: {
    includesOneOf?: Array<string>
    includesAllOf?: Array<string>
  }
  isExcluded: boolean
  isSelectedForEdit?: boolean // TODO: move to state
}

export interface CategoryDto extends Category {
  averageBalancePerMonth: string
  totalBalance: number
  totalBalanceFormatted: string
  percentOfTotal: number
  amountOfEntries: number
  averageAmountPerMonth: number
}
