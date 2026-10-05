import * as XLSX from 'xlsx';

/**
 * Exports rows as a real .xlsx workbook. Same column shape as downloadCsv
 * (label + key + optional format), so a list can switch between the two
 * without touching its column definitions.
 */
export function downloadXlsx(fileName, columns, rows, sheetName = 'Sheet1') {
  const header = columns.map((col) => col.label);
  const body = rows.map((row) => columns.map((col) => (col.format ? col.format(row[col.key], row) : row[col.key]) ?? ''));

  const sheet = XLSX.utils.aoa_to_sheet([header, ...body]);
  sheet['!cols'] = columns.map((col) => ({ wch: Math.max(col.label.length + 2, 12) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}
