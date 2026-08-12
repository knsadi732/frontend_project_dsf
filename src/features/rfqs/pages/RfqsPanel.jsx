import { useState } from 'react';
import { useRfqsQuery } from '@/features/rfqs/queries/useRfqsQuery';
import { RfqDetailModal } from '@/features/rfqs/components/RfqDetailModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const RFQ_STATUS_VARIANT = {
  draft: 'default',
  sent: 'info',
  quoted: 'warning',
  vendor_selected: 'success',
  converted_to_po: 'success',
  cancelled: 'danger',
};

// plan.md 11.6-11.9: RFQ -> Vendor Quotation -> Quotation Comparison -> Vendor
// Selection, sitting between an approved Purchase Request and its eventual
// Purchase Order. `onCreatePo` is threaded down to the detail modal, which
// fires it once a vendor has been selected — the parent (PurchasesPage) owns
// opening the actual PurchaseFormModal pre-filled from the chosen quotation.
export function RfqsPanel({ onCreatePo }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedRfqId, setSelectedRfqId] = useState(null);

  const { data, isLoading } = useRfqsQuery({ page, pageSize });

  // The list endpoint only joins PR/branch names (rfq.repository.js
  // SELECT_WITH_NAMES) — vendors/materialItems/quotations are attached by
  // GET /rfqs/:id only (rfq.service.js getRfq's comparison payload), so a
  // vendor count column here isn't available without opening the detail modal.
  const columns = [
    { key: 'rfqNumber', header: 'RFQ Number' },
    { key: 'prNumber', header: 'PR Number', render: (row) => row.prNumber ?? '—' },
    { key: 'deliveryDate', header: 'Delivery Date', render: (row) => row.deliveryDate ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={RFQ_STATUS_VARIANT} /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">Request for Quotations — sent to vendors from an approved purchase request, compared, then a vendor is selected.</p>

      <AppTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRowClick={(rfq) => setSelectedRfqId(rfq.id)}
        emptyMessage="No RFQs yet — raise one from an approved purchase request."
      />

      <RfqDetailModal
        open={Boolean(selectedRfqId)}
        rfqId={selectedRfqId}
        onClose={() => setSelectedRfqId(null)}
        onCreatePo={(rfq, quotation) => {
          setSelectedRfqId(null);
          onCreatePo(rfq, quotation);
        }}
      />
    </div>
  );
}
