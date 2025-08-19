import type {ObservableVariable} from "@dobschal/observable/Observable";
import {Observable} from "@dobschal/observable";

// region types and type helpers

export type Optional<T> = T | undefined;

export type Nullable<T> = T | null;

export function isNonEmptyString(val: unknown): boolean {
    return typeof val === "string" && val.length > 0;
}

export function bind<T, K extends keyof T>(observable: ObservableVariable<T>, key: K): ObservableVariable<T[K]> {
    const observableOfProp = Observable(observable.value[key]);
    observable.subscribe((value: T) => observableOfProp.value = value[key]);
    observableOfProp.subscribe((value) => observable.value[key] = value);
    return observableOfProp;
}

export function ensure<T>(val: Optional<T> | Nullable<T>): T {
    if (val === null || val === undefined) {
        throw new Error('Fatal Error: Value is null or undefined.');
    }
    return val;
}

// endregion

// region utility functions

export function lastItem<T>(items: Array<T>): T {
    return items[items.length - 1];
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// endregion

// region formatting & conversion

export function formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * @param date - A date string in the format "DD.MM.YYYY"
 */
export function toDate(date: string): Date {
    const parts = date.split('.');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: ${date}. Expected format is "DD.MM.YYYY".`);
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

export function toArray(value: string): Array<string> {
    return value.split(",").map(v => v.trim());
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dateStringToMonthDisplay(date: string): string {
    const parts = date.split('.');
    if (parts.length !== 3) throw new Error("Invalid date format: " + date);
    const month = months[parseInt(parts[1], 10) - 1];
    return `${month} ${parts[2]}`;
}

export function getLastDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function camelCaseToKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// endregion
