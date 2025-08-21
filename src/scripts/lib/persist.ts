import type { ObservableVariable } from '@dobschal/observable/Observable'
import { Observable } from '@dobschal/observable'
import type { Optional } from './util.ts'

export function persist<T> (key: string, initValue: T): ObservableVariable<T> {
  const observable = Observable(readFromStorage<T>(key) ?? initValue, true)
  observable.subscribe((value: T) => {
    writeToStorage(key, value)
  })
  return observable
}

function writeToStorage<T> (key: string, value: T): void {
  console.log('Store changed:', key, value)
  window.localStorage.setItem(key, JSON.stringify({ value }))
}

function readFromStorage<T> (key: string): Optional<T> {
  const valueAsString = window.localStorage.getItem(key)
  if (!valueAsString) return
  try {
    return JSON.parse(valueAsString)?.value ?? undefined
  } catch (e) {
    console.error(e)
  }
}
