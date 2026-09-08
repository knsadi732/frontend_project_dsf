import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

// Marketplace tax invoices (Meesho/Flipkart/etc) use the company's own
// sequential numbering (DSF/FY/...) rather than the internal order number,
// and HSN/rate sometimes need a manual correction against what the
// marketplace's own portal shows — both aren't something the regular
// direct-customer invoice flow needs, so this is a separate small step
// only for orders with a channelOrderNumber (see SalesPage.jsx).
export function MarketplaceInvoiceDetailsModal({ open, onClose, defaultInvoiceNumber, items, onConfirm }) {
  const [invoiceNumber, setInvoiceNumber] = useState(defaultInvoiceNumber ?? 'DSF/FY/');
  const [lineItems, setLineItems] = useState(items ?? []);

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
          <AppButton onClick={() => onConfirm({ invoiceNumber, items: lineItems })}>Download invoice</AppButton>
        </>
      }
    >
      <p className="mb-4 text-sm text-text-muted">
        Set the invoice number and confirm HSN/rate for this marketplace order before downloading.
      </p>

      <AppInput label="Invoice No" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="mb-4" />

      <div className="flex flex-col gap-3">
        {lineItems.map((item, index) => (
          <div key={index} className="rounded-md border border-border p-3">
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
