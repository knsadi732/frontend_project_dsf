import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { AppTable } from '@/components/ui/AppTable';

function fmt(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATE_COLUMNS = [
  { key: 'state_name', header: 'State' },
  { key: 'invoice_count', header: 'Invoices' },
  { key: 'units', header: 'Units sold' },
  { key: 'sales_taxable', header: 'Taxable value', render: (row) => fmt(row.sales_taxable) },
  { key: 'sales_gst', header: 'GST', render: (row) => fmt(row.sales_gst) },
  { key: 'credit_note_count', header: 'Credit notes' },
  { key: 'credit_note_taxable', header: 'CN taxable', render: (row) => fmt(row.credit_note_taxable) },
  { key: 'credit_note_gst', header: 'CN GST', render: (row) => fmt(row.credit_note_gst) },
  { key: 'net_taxable', header: 'Net taxable', render: (row) => fmt(row.net_taxable) },
  { key: 'net_gst', header: 'Net GST', render: (row) => fmt(row.net_gst) },
  { key: 'documents', header: 'Invoice / CN no.', render: (row) => row.documents.join(', ') },
];

const LINE_COLUMNS = [
  { key: 'state_name', header: 'State' },
  { key: 'document_no', header: 'Invoice / CN no.' },
  { key: 'document_type', header: 'Type', render: (row) => (row.document_type === 'invoice' ? 'Invoice' : 'Credit note') },
  { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-IN') },
  { key: 'units', header: 'Units' },
  { key: 'taxable_value', header: 'Taxable value', render: (row) => fmt(row.taxable_value) },
  { key: 'cgst_amount', header: 'CGST', render: (row) => fmt(row.cgst_amount) },
  { key: 'sgst_amount', header: 'SGST', render: (row) => fmt(row.sgst_amount) },
  { key: 'igst_amount', header: 'IGST', render: (row) => fmt(row.igst_amount) },
  { key: 'gst_amount', header: 'Total GST', render: (row) => fmt(row.gst_amount) },
];

function totalsRow(states) {
  const sum = (key) => states.reduce((acc, s) => acc + Number(s[key] || 0), 0);
  return {
    state_name: 'Total',
    invoice_count: sum('invoice_count'),
    units: sum('units'),
    sales_taxable: sum('sales_taxable'),
    sales_gst: sum('sales_gst'),
    credit_note_count: sum('credit_note_count'),
    credit_note_taxable: sum('credit_note_taxable'),
    credit_note_gst: sum('credit_note_gst'),
    net_taxable: sum('net_taxable'),
    net_gst: sum('net_gst'),
    documents: [],
  };
}

/** GSTR-1 helper: sales by place-of-supply state, with the invoice / credit note numbers behind each state. */
export function GstStateWiseSection({ report, isLoading }) {
  const states = report?.stateWise ?? [];
  const rows = states.length ? [...states, totalsRow(states)] : [];

  return (
    <BaseCard>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">State-wise sales &amp; GST (invoice-wise)</h3>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              State summary — credit notes are counted in the month they were issued
            </p>
            <AppTable
              columns={STATE_COLUMNS}
              data={rows}
              rowKey={(row, index) => `${row.state_code ?? row.state_name}-${index}`}
              isLoading={isLoading}
              emptyMessage="No outward supplies for this period"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Invoice &amp; credit note detail</p>
            <AppTable
              columns={LINE_COLUMNS}
              data={report?.stateWiseLines ?? []}
              rowKey={(row, index) => `${row.document_no}-${index}`}
              isLoading={isLoading}
              emptyMessage="No invoices for this period"
            />
          </div>
        </div>
      </CardBody>
    </BaseCard>
  );
}
