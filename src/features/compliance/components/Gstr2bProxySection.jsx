import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { AppTable } from '@/components/ui/AppTable';

function fmt(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

const COLUMNS = [
  { key: 'transaction_date', header: 'Date' },
  { key: 'party_name', header: 'Party', render: (row) => row.party_name || '—' },
  { key: 'party_gstin', header: 'GSTIN', render: (row) => row.party_gstin || '—' },
  { key: 'hsn_code', header: 'HSN', render: (row) => row.hsn_code || '—' },
  { key: 'gst_rate', header: 'Rate', render: (row) => `${row.gst_rate}%` },
  { key: 'taxable_value', header: 'Taxable value', render: (row) => fmt(row.taxable_value) },
  { key: 'cgst_amount', header: 'CGST', render: (row) => fmt(row.cgst_amount) },
  { key: 'sgst_amount', header: 'SGST', render: (row) => fmt(row.sgst_amount) },
  { key: 'igst_amount', header: 'IGST', render: (row) => fmt(row.igst_amount) },
];

export function Gstr2bProxySection({ report, isLoading }) {
  return (
    <BaseCard>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">GSTR-2B (internal proxy)</h3>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
            {report?.disclaimer ||
              'This is an internal proxy built from purchase/expense entries recorded in this system, not the GSTN-reconciled GSTR-2B. Cross-check against the portal-downloaded GSTR-2B before filing.'}
          </div>

          <AppTable
            columns={COLUMNS}
            data={report?.rows ?? []}
            rowKey={(row, index) => `${row.transaction_id}-${index}`}
            isLoading={isLoading}
            emptyMessage="No purchase/expense entries for this period"
          />
        </div>
      </CardBody>
    </BaseCard>
  );
}
