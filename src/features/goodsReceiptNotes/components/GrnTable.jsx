import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UploadButton } from '@/components/ui/ActionButtons';
import { goodsReceiptNoteApi } from '@/features/goodsReceiptNotes/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

const STATUS_VARIANT = { draft: 'default', inspected: 'warning', completed: 'success', rejected: 'danger' };

// Only these are accepted server-side (anything else 422s with GRN_002) —
// checked client-side too so a wrong file type fails fast with a clear
// message instead of a round-trip.
const ACCEPTED_INVOICE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function VendorInvoiceCell({ row }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handleFileSelected = (file) => {
    if (!ACCEPTED_INVOICE_TYPES.includes(file.type)) {
      pushToast('error', 'Only PDF, JPEG, or PNG files are accepted for a vendor invoice');
      return;
    }
    setUploading(true);
    goodsReceiptNoteApi
      .uploadInvoice({ grnNumber: row.grnNumber, file })
      .then(() => {
        pushToast('success', 'Vendor invoice uploaded');
        queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceiptNotes.all });
      })
      .catch(() => pushToast('error', 'Failed to upload vendor invoice'))
      .finally(() => setUploading(false));
  };

  return (
    <div className="flex items-center gap-3">
      {row.vendorInvoiceNumber && <span className="text-text-muted">{row.vendorInvoiceNumber}</span>}
      {row.vendorInvoiceUrl ? (
        <a
          href={row.vendorInvoiceUrl}
          target="_blank"
          rel="noreferrer"
          title="View uploaded invoice"
          className="inline-flex items-center text-text-muted hover:text-primary"
        >
          <ExternalLink className="size-4" />
        </a>
      ) : (
        <UploadButton
          label="Upload vendor invoice"
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploading}
          onFileSelected={handleFileSelected}
        />
      )}
    </div>
  );
}

export function GrnTable({
  grns,
  purchaseOrdersById,
  warehousesById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) {
  const columns = [
    { key: 'grnNumber', header: 'GRN Number' },
    { key: 'po', header: 'Purchase Order', render: (row) => purchaseOrdersById?.[row.purchaseOrderId]?.poNumber ?? '—' },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'vendorInvoiceNumber', header: 'Vendor Invoice', render: (row) => <VendorInvoiceCell row={row} /> },
    { key: 'receivedDate', header: 'Received Date', render: (row) => (row.receivedDate ? String(row.receivedDate).slice(0, 10) : '—') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={STATUS_VARIANT} /> },
  ];

  return (
    <AppTable
      columns={columns}
      data={grns}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No goods receipt notes yet"
    />
  );
}
