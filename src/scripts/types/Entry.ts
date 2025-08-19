import type {Category} from "./Category.ts";

export interface Entry {
    date: string; // e.g. "01.01.2023"
    recipientSender: string;
    type: string; // e.g. "Lastschrift", "Überweisung"
    description: string;
    balance: number;
    value: number;
    currency: string; // e.g. "EUR"
}

export interface EntryDto extends Entry {
    balanceFormatted?: string;
    valueFormatted?: string;
    category?: Category;
    isHidden?: boolean;
}
