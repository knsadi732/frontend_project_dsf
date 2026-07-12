import { Download, FileText } from 'lucide-react';
import { BaseCard } from '@/components/ui/BaseCard';
import { BaseTable } from '@/components/ui/BaseTable';
import { AppButton } from '@/components/ui/AppButton';
import { downloadCsv } from '@/utils/downloadCsv';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function cellValue(column, row) {
  return column.format ? column.format(row) : (row[column.key] ?? '—');
}

// Generic read-only report table: one `ReportSection` instance per named
// report in Chapter 18 (Sales Register, Purchase Register, etc.), fed by
// data already fetched elsewhere in the app. `columns[].format(row)` drives
// on-screen rendering, CSV export, and PDF export identically so a report
// never shows different numbers across formats.
export function ReportSection({ title, description, columns, rows, fileName, emptyMessage = 'No records for this period' }) {
  const tableColumns = columns.map((column) => ({
    key: column.key,
    header: column.header,
    render: (row) => cellValue(column, row),
  }));

  const exportRows = () => rows.map((row) => Object.fromEntries(columns.map((column) => [column.key, cellValue(column, row)])));

  const handleExportCsv = () => {
    downloadCsv(
      `${fileName}.csv`,
      columns.map((column) => ({ key: column.key, label: column.header })),
      exportRows(),
    );
  };

  const handleExportPdf = () => {
    generateRecordPdf({
      title,
      items: exportRows(),
      itemsColumns: columns.map((column) => ({ key: column.key, label: column.header, width: 180 / columns.length })),
      fileName: `${fileName}.pdf`,
    });
  };

  return (
    <BaseCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          {description && <p className="text-xs text-text-muted">{description}</p>}
        </div>
        <div className="flex gap-1">
          <AppButton variant="ghost" size="sm" onClick={handleExportCsv} disabled={!rows.length}>
            <Download className="size-4" />
            CSV
          </AppButton>
          <AppButton variant="ghost" size="sm" onClick={handleExportPdf} disabled={!rows.length}>
            <FileText className="size-4" />
            PDF
          </AppButton>
        </div>
      </div>
      <BaseTable columns={tableColumns} data={rows} emptyMessage={emptyMessage} />
    </BaseCard>
  );
}
