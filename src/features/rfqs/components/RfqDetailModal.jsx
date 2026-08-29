import { useState } from 'react';
import { Award, Send } from 'lucide-react';
import { useRfqQuery } from '@/features/rfqs/queries/useRfqQuery';
import { useSendRfq } from '@/features/rfqs/mutations/useSendRfq';
import { useSelectVendor } from '@/features/rfqs/mutations/useSelectVendor';
import { useRecordVendorQuotation } from '@/features/rfqs/mutations/useRecordVendorQuotation';
import { VendorQuotationFormModal } from '@/features/rfqs/components/VendorQuotationFormModal';
import { AppModal } from '@/components/ui/AppModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';

// Landed cost per quotation = Σ(unitPrice × qty × (1 + gst%)) + freight − discount,
// qty pulled from the RFQ's material list (quotations don't carry quantity —
// vendor_quotation_items is priced-only). This is the number vendor selection
// should actually be based on (plan.md 11.20 "Vendor selection must be based
// on quotation comparison"), not just the per-unit price.
function landedCost(quotation, materialItems) {
  // Each material line is either a Product Variant or an Item Master row —
  // key the quantity lookup by whichever id it actually has.
  const quantityByLine = Object.fromEntries(
    (materialItems ?? []).map((item) => [item.productVariantId ?? item.itemId, Number(item.quantity) || 0]),
  );
  const itemsTotal = (quotation.items ?? []).reduce((sum, item) => {
    const qty = quantityByLine[item.productVariantId ?? item.itemId] ?? 0;
    const gstFactor = 1 + (Number(item.gstPercentage) || 0) / 100;
    return sum + qty * Number(item.unitPrice) * gstFactor;
  }, 0);
  return itemsTotal + Number(quotation.freightAmount || 0) - Number(quotation.discountAmount || 0);
}

// plan.md 11.8-11.9: Quotation Comparison + Vendor Selection, plus RFQ's
// send/record-quotation actions and — once a vendor is selected — "Create
// Purchase Order", which pre-fills the existing PurchaseFormModal.
export function RfqDetailModal({ open, onClose, rfqId, onCreatePo }) {
  const { data: rfq, isLoading } = useRfqQuery(rfqId);
  const [quotationFormOpen, setQuotationFormOpen] = useState(false);
  const sendRfq = useSendRfq();
  const selectVendor = useSelectVendor();
  const recordQuotation = useRecordVendorQuotation();

  const selectedQuotation = rfq?.quotations?.find((q) => q.id === rfq.selectedVendorQuotationId);
  const canRecordQuotation = rfq && (rfq.status === 'sent' || rfq.status === 'quoted');
  // Backend only accepts select-vendor while status === 'quoted' (assertTransition
  // quoted -> vendor_selected) — gate the action here so a click can't fire a
  // request the backend will just reject.
  const canSelectVendor = rfq?.status === 'quoted';

  const comparisonRows = (rfq?.quotations ?? [])
    .map((quotation) => ({ ...quotation, totalCost: landedCost(quotation, rfq?.materialItems) }))
    .sort((a, b) => a.totalCost - b.totalCost);

  const comparisonColumns = [
    {
      key: 'vendorName',
      header: 'Vendor',
      render: (row) => (
        <span className="flex items-center gap-1.5">
          {row.id === rfq?.selectedVendorQuotationId && <Award className="size-4 text-success" />}
          {row.vendorName}
        </span>
      ),
    },
    { key: 'qualityRating', header: 'Quality', render: (row) => (row.qualityRating != null ? `${row.qualityRating} / 5` : '—') },
    { key: 'freightAmount', header: 'Freight', render: (row) => `₹${Number(row.freightAmount).toLocaleString('en-IN')}` },
    { key: 'discountAmount', header: 'Discount', render: (row) => `₹${Number(row.discountAmount).toLocaleString('en-IN')}` },
    { key: 'totalCost', header: 'Landed cost', render: (row) => <span className="font-semibold text-text">₹{row.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span> },
    { key: 'deliveryTimeDays', header: 'Delivery', render: (row) => (row.deliveryTimeDays != null ? `${row.deliveryTimeDays} days` : '—') },
    { key: 'paymentTerms', header: 'Payment terms', render: (row) => row.paymentTerms || '—' },
    ...(canSelectVendor
      ? [
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex justify-end">
                <AppButton
                  variant={row.id === rfq.selectedVendorQuotationId ? 'success' : 'primary'}
                  size="sm"
                  disabled={row.id === rfq.selectedVendorQuotationId}
                  loading={selectVendor.isPending}
                  onClick={() => selectVendor.mutate({ id: rfq.id, vendorQuotationId: row.id })}
                >
                  {row.id === rfq.selectedVendorQuotationId ? 'Selected' : 'Select this vendor'}
                </AppButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <AppModal open={open} onClose={onClose} title={rfq ? `${rfq.rfqNumber} — ${rfq.prNumber ?? ''}` : 'RFQ'} className="max-w-3xl">
        {isLoading || !rfq ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {rfq.vendors.map((v) => (
                  <span key={v.vendorId} className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-text-muted">
                    Sent to {v.vendorName}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {rfq.status === 'draft' && (
                  <AppButton size="sm" onClick={() => sendRfq.mutate(rfq.id)} loading={sendRfq.isPending}>
                    <Send className="size-4" />
                    Send RFQ
                  </AppButton>
                )}
                {canRecordQuotation && (
                  <CreateButton size="sm" onClick={() => setQuotationFormOpen(true)}>
                    Record quotation
                  </CreateButton>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-text">Quotation comparison</span>
              <AppTable columns={comparisonColumns} data={comparisonRows} emptyMessage="No vendor quotations recorded yet" />
            </div>

            {selectedQuotation && (
              <div className="flex justify-end border-t border-border pt-3">
                <AppButton onClick={() => onCreatePo(rfq, selectedQuotation)} disabled={rfq.status === 'converted_to_po'}>
                  {rfq.status === 'converted_to_po' ? 'Purchase order already created' : 'Create Purchase Order'}
                </AppButton>
              </div>
            )}
          </div>
        )}
      </AppModal>

      <VendorQuotationFormModal
        open={quotationFormOpen}
        rfq={rfq}
        onClose={() => setQuotationFormOpen(false)}
        onSubmit={(values) => recordQuotation.mutateAsync(values).then(() => setQuotationFormOpen(false))}
        isSubmitting={recordQuotation.isPending}
      />
    </>
  );
}
