import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Upload } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
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
  const inputId = `grn-invoice-upload-${row.id}`;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
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
      <div className="flex items-center gap-2">
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
          <>
            <label
              htmlFor={inputId}
              title="Upload vendor invoice"
              className={`inline-flex cursor-pointer items-center text-primary hover:opacity-80 ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Upload className="size-4" />
            </label>
            <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </>
        )}
      </div>
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
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>,
    },
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
