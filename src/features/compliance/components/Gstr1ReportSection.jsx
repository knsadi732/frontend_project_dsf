import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { AppTable } from '@/components/ui/AppTable';

function fmt(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

const RATE_SUMMARY_COLUMNS = [
  { key: 'hsn_code', header: 'HSN', render: (row) => row.hsn_code || '—' },
  { key: 'gst_rate', header: 'Rate', render: (row) => `${row.gst_rate}%` },
  { key: 'party_type', header: 'Party type', render: (row) => row.party_type?.toUpperCase() ?? '—' },
  { key: 'invoice_count', header: 'Invoices' },
  { key: 'taxable_value', header: 'Taxable value', render: (row) => fmt(row.taxable_value) },
  { key: 'cgst_amount', header: 'CGST', render: (row) => fmt(row.cgst_amount) },
  { key: 'sgst_amount', header: 'SGST', render: (row) => fmt(row.sgst_amount) },
  { key: 'igst_amount', header: 'IGST', render: (row) => fmt(row.igst_amount) },
];

const INVOICE_COLUMNS = [
  { key: 'transaction_date', header: 'Date' },
  { key: 'party_name', header: 'Party', render: (row) => row.party_name || '—' },
  { key: 'party_gstin', header: 'GSTIN', render: (row) => row.party_gstin || '—' },
  { key: 'hsn_code', header: 'HSN', render: (row) => row.hsn_code || '—' },
  { key: 'gst_rate', header: 'Rate', render: (row) => `${row.gst_rate}%` },
  { key: 'taxable_value', header: 'Taxable value', render: (row) => fmt(row.taxable_value) },
  { key: 'cgst_amount', header: 'CGST', render: (row) => fmt(row.cgst_amount) },
  { key: 'sgst_amount', header: 'SGST', render: (row) => fmt(row.sgst_amount) },
  { key: 'igst_amount', header: 'IGST', render: (row) => fmt(row.igst_amount) },
  { key: 'invoice_value', header: 'Invoice value', render: (row) => fmt(row.invoice_value) },
];

export function Gstr1ReportSection({ report, isLoading }) {
  return (
    <BaseCard>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">GSTR-1 — outward supplies</h3>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">B2B summary (HSN &amp; rate)</p>
            <AppTable
              columns={RATE_SUMMARY_COLUMNS}
              data={report?.b2bSummary ?? []}
              rowKey={(row, index) => `${row.hsn_code}-${row.gst_rate}-b2b-${index}`}
              isLoading={isLoading}
              emptyMessage="No B2B outward supplies for this period"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">B2C summary (HSN &amp; rate)</p>
            <AppTable
              columns={RATE_SUMMARY_COLUMNS}
              data={report?.b2cSummary ?? []}
              rowKey={(row, index) => `${row.hsn_code}-${row.gst_rate}-b2c-${index}`}
              isLoading={isLoading}
              emptyMessage="No B2C outward supplies for this period"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">B2B invoice detail</p>
            <AppTable
              columns={INVOICE_COLUMNS}
              data={report?.b2bInvoices ?? []}
              rowKey={(row, index) => `${row.transaction_id}-${index}`}
              isLoading={isLoading}
              emptyMessage="No B2B invoices for this period"
            />
          </div>
        </div>
      </CardBody>
    </BaseCard>
  );
}
