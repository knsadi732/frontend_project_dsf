import { useEffect, useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { salesApi } from '@/services/sales.api';

// Marketplace tax invoices (Meesho/Flipkart/etc) use the company's own
// sequential numbering (DSF/FY.../....) rather than the internal order
// number, and HSN/rate sometimes need a manual correction against what the
// marketplace's own portal shows — both aren't something the regular
// direct-customer invoice flow needs, so this is a separate small step
// only for orders with a channelOrderNumber (see SalesPage.jsx).
export function MarketplaceInvoiceDetailsModal({ open, onClose, items, onConfirm, isSaving }) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [lineItems, setLineItems] = useState([]);

  // Reset to the given items the instant `open` flips true — during render
  // (the "adjusting state on a prop change" pattern), not in an effect, so
  // it doesn't cost an extra cascading render. The modal stays mounted
  // between opens (see SalesPage.jsx), so this can't just be a useState
  // initializer.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setLineItems(items ?? []);
  }

  // The invoice-number fetch is a real async side effect (network call), so
  // it stays in an effect — only the setState-in-effect-body case above
  // needed to move.
  useEffect(() => {
    if (!open) return;
    salesApi.generateMarketplaceInvoiceNumber().then(setInvoiceNumber);
  }, [open]);

  if (!open) return null;

  const updateItem = (index, field, value) => {
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Marketplace invoice details"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton loading={isSaving} onClick={() => onConfirm({ invoiceNumber, items: lineItems })}>
            Save &amp; download invoice
          </AppButton>
        </>
      }
    >
      <p className="mb-4 text-sm text-text-muted">
        Invoice number is auto-generated (editable if needed) — confirm HSN/rate for this marketplace order before
        downloading. Rate changes are saved to the order and recompute its GST split.
      </p>

      <AppInput
        label="Invoice No"
        value={invoiceNumber}
        onChange={(e) => setInvoiceNumber(e.target.value)}
        placeholder="Generating…"
        className="mb-4"
      />

      <div className="flex flex-col gap-3">
        {lineItems.map((item, index) => (
          <div key={item.id ?? index} className="rounded-md border border-border p-3">
            <p className="mb-2 text-sm font-medium text-text">{item.label}</p>
            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label="HSN Code"
                value={item.hsnCode ?? ''}
                onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
              />
              <AppInput
                label="Rate"
                type="number"
                step="0.01"
                value={item.unitPrice ?? ''}
                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </AppModal>
  );
}
