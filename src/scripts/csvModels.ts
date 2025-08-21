export enum CsvColumnType {
  Description = 'description',
  Date = 'date',
  RecipientSender = 'recipient-sender', // Recipient and sender are often in the same column
  Type = 'type', // Like Lastschrift, Überweisung, etc.
  Balance = 'balance',
  Value = 'value',
  Currency = 'currency',
}

export interface CsvColumn {
  index: number
  name: string
  type: CsvColumnType
}

export interface CsvModel {
  labelLine: number // The line where the column names are defined
  startLine: number
  columns: Array<CsvColumn>
}

export const ingModel: CsvModel = {
  labelLine: 14,
  startLine: 15,
  columns: [
    { index: -1, name: 'Buchung', type: CsvColumnType.Date },
    { index: -1, name: 'Auftraggeber/Empfänger', type: CsvColumnType.RecipientSender },
    { index: -1, name: 'Buchungstext', type: CsvColumnType.Type },
    { index: -1, name: 'Verwendungszweck', type: CsvColumnType.Description },
    { index: -1, name: 'Saldo', type: CsvColumnType.Balance },
    { index: -1, name: 'Betrag', type: CsvColumnType.Value },
    { index: -1, name: 'Währung', type: CsvColumnType.Currency }
  ]
}

export const postbankModel: CsvModel = {
  labelLine: 8,
  startLine: 9,
  columns: [
    { index: -1, name: 'Buchungstag', type: CsvColumnType.Date },
    { index: -1, name: 'Begünstigter / Auftraggeber', type: CsvColumnType.RecipientSender },
    { index: -1, name: 'Umsatzart', type: CsvColumnType.Type },
    { index: -1, name: 'Verwendungszweck', type: CsvColumnType.Description },
    { index: -1, name: 'Betrag', type: CsvColumnType.Balance },
    { index: -1, name: 'Betrag', type: CsvColumnType.Value },
    { index: -1, name: 'Währung', type: CsvColumnType.Currency }
  ]
}
