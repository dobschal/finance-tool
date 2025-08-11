import {ensure, onClick, onSubmit, referenceDom, showToast, toDate, updateDom} from "../util.ts";
import {type CsvColumn, CsvColumnType, type CsvModel, ingModel, postbankModel} from "../csvModels.ts";
import {retrieve, store} from "../storage.ts";
import type {Entry} from "../types/Entry.ts";

// region setup

const dom = referenceDom<{
    importModalCancelButton: HTMLButtonElement;
    importModal: HTMLDialogElement;
    importForm: HTMLFormElement;
    importFileInput: HTMLInputElement;
    importBankSelect: HTMLSelectElement;
}>();

const template = `
    <dialog id="import-modal">
        <form id="import-form">
            <h2>Import Data</h2>
            <p class="alert">
                The app expects german formats for dates and numbers. E.g. "31.01.2023" for dates and "1.234,56" for
                numbers.
            </p>
            <label for="import-bank-select">Select Institute:</label>
            <select name="bank-select" id="import-bank-select">
                <option value="ing" selected>ING</option>
                <option value="postbank">Postbank</option>
            </select>
            <label for="import-file-input">Select File:</label>
            <input type="file" id="import-file-input" accept=".csv"/>
            <div class="button-group">
                <button type="submit">Import</button>
                <button type="button" class="secondary" id="import-modal-cancel-button">Cancel</button>
            </div>
        </form>
    </dialog>
`;

export default function (target: string) {

    updateDom(target, template);

    onClick(dom.importModalCancelButton, () => {
        dom.importModal.close();
    });

    onSubmit(dom.importForm, async () => {
        const file = dom.importFileInput.files?.[0];
        if (!file) {
            alert("Please select a file to import.");
            return;
        }

        const bankId = dom.importBankSelect.value;
        if (!bankId) {
            alert("Please select a bank to import the file into.");
            return;
        }

        await importFile(file, bankId);

        dom.importModal.close();
    });
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
    const newEntries: Array<Entry> = lines.filter(line => !!line).map(line => {
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
    });

    // Merge with existing entries
    const existingEntries = retrieve("entries") ?? [];
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

    store("entryFilter", {
        startMonth: "01.1970",
        endMonth: "12.3000",
        includeEarnings: false,
        categoryId: "",
    });
    store("entries", allEntries);
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
