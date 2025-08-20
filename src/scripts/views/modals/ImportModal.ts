import {bind, ensure, type Optional, toDate} from "../../lib/util.ts";
import {type CsvColumn, CsvColumnType, type CsvModel, ingModel, postbankModel} from "../../csvModels.ts";
import {entries, entryFilter, state} from "../../store.ts";
import type {Entry} from "../../types/Entry.ts";
import {html} from "@dobschal/html.js";
import {showToast} from "../../lib/toast.ts";
import Modal from "./Modal.ts";

// region setup

export default function () {

    let bankId = "ing";
    let file: Optional<File>;
    const isOpen = bind(state, "isImportModalOpen");

    function close() {
        state.value.isImportModalOpen = false;
    }

    function onSelectBank(event: Event) {
        bankId = (event.target as HTMLSelectElement).value;
    }

    function onFileChange(event: Event) {
        file = (event.target as HTMLInputElement).files?.[0];
    }

    async function onSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (!file) {
            alert("Please select a file to import.");
            return;
        }
        if (!bankId) {
            alert("Please select a bank to import the file into.");
            return;
        }
        await importFile(file, bankId);
        close();
    }

    const modalBody = html`
        <form onsubmit="${onSubmit}">
            <p class="alert">
                The app expects german formats for dates and numbers. E.g. "31.01.2023" for dates and "1.234,56" for
                numbers.
            </p>
            <div class="form-group">
                <label for="import-bank-select">Select Institute:</label>
                <select name="bank-select" onchange="${onSelectBank}">
                    <option value="ing" selected>ING</option>
                    <option value="postbank">Postbank</option>
                </select>
            </div>
            <div class="form-group">
                <label for="import-file-input">Select File:</label>
                <input type="file" onchange="${onFileChange}" accept=".csv"/>
            </div>
            <div class="button-group">
                <button type="submit">Import</button>
                <button type="button" class="secondary" onclick="${close}">Cancel</button>
            </div>
        </form>
    `;

    return Modal(isOpen, "Import Data", modalBody);
}

// endregion

// region functions

function readFileText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file, "iso-8859-1"); // Use ISO-8859-1 encoding for CSV files
    });
}

async function importFile(file: File, bankId: string): Promise<void> {
    const model = getCsvModel(bankId);
    const fileContent = await readFileText(file);
    console.log(`Importing file: ${file.name} for bank: ${bankId}`);

    // find correct column indices based on the name in the model
    const headerLine = fileContent.split("\n")[model.labelLine - 1];
    const headerColumns = headerLine.split(";");
    model.columns.forEach(column => {
        const index = headerColumns.findIndex(header => header.toLowerCase().includes(column.name.toLowerCase()));
        if (index !== -1) {
            column.index = index;
        } else {
            showToast(`Column "${column.name}" not found in the file.`, "error");
            column.index = -1; // Set to -1 if not found
        }
    });
    const lines = fileContent.split("\n").slice(model.startLine - 1);
    const newEntries: Array<Entry> = lines
        .filter(line => !!line)
        .map(line => {
            try {
                const columns = line.split(";");
                const entry: Entry = {
                    date: readStringColumn(CsvColumnType.Date, model.columns, columns),
                    recipientSender: readStringColumn(CsvColumnType.RecipientSender, model.columns, columns),
                    type: readStringColumn(CsvColumnType.Type, model.columns, columns),
                    description: readStringColumn(CsvColumnType.Description, model.columns, columns),
                    balance: readNumberColumn(CsvColumnType.Balance, model.columns, columns),
                    value: readNumberColumn(CsvColumnType.Value, model.columns, columns),
                    currency: readStringColumn(CsvColumnType.Currency, model.columns, columns),
                };
                return entry;
            } catch (error) {
                console.error("Error while reading:", line, error);
            }
        })
        .filter(e => e) as Array<Entry>;

    // Merge with existing entries
    const existingEntries = entries.value;
    const existingEntriesKeys = new Set(existingEntries.map(entry => entry.date + entry.recipientSender + entry.value + entry.description));
    const uniqueEntries = newEntries.filter(entry => {
        const entryKey = entry.date + entry.recipientSender + entry.value + entry.description;
        if (existingEntriesKeys.has(entryKey)) {
            return false; // Skip duplicate newEntries
        }
        existingEntriesKeys.add(entryKey);
        return true;
    });
    const allEntries = [...existingEntries, ...uniqueEntries].sort((a, b) => {
        const dateA = toDate(a.date);
        const dateB = toDate(b.date);
        return dateB.getTime() - dateA.getTime();
    });

    entryFilter.value = {
        startMonth: "01.1970",
        endMonth: "12.3000",
        includeEarnings: false,
        hiddenCategories: []
    };
    entries.value = allEntries;
}

function readStringColumn(type: CsvColumnType, columns: Array<CsvColumn>, values: Array<string>): string {
    const config = ensure(columns.find(column => column.type === type));
    const value = values[config.index];
    return value.trim(); // Trim whitespace from the value
}

function readNumberColumn(type: CsvColumnType, columns: Array<CsvColumn>, values: Array<string>): number {
    const config = ensure(columns.find(column => column.type === type));
    const value = values[config.index];
    const sanitizedValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(sanitizedValue);
}

function getCsvModel(bankId: string): CsvModel {
    switch (bankId) {
        case "ing":
            return ingModel;
        case "postbank":
            return postbankModel;
        default:
            throw new Error(`Unknown bank ID: ${bankId}`);
    }
}

// endregion
