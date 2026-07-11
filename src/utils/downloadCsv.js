function toCsvValue(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Exports an entire row set as one CSV file (see summary.md table "Export"
 * rule) instead of a per-row download, so a list downloads in a single click.
 */
export function downloadCsv(fileName, columns, rows) {
  const header = columns.map((col) => toCsvValue(col.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((col) => toCsvValue(col.format ? col.format(row[col.key], row) : row[col.key])).join(','),
  );

  const csv = [header, ...lines].join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
