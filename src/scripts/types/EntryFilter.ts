export interface EntryFilter {
  startMonth: string
  endMonth: string
  includeEarnings: boolean
  includeExpenses: boolean
  hiddenCategories: Array<string>
}
