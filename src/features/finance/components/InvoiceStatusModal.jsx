import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { PAYMENT_STATUS } from '@/constants/statusEnums';

// Backend only accepts these three (finance.validator.js updateBillStatus) —
// "overdue" is a derived/filter-only status elsewhere in the app, not a
// state a bill can actually be set to.
const STATUS_OPTIONS = [
  { value: PAYMENT_STATUS.UNPAID, label: 'Unpaid' },
  { value: PAYMENT_STATUS.PARTIAL, label: 'Partial' },
  { value: PAYMENT_STATUS.PAID, label: 'Paid' },
];

// Invoices (bills) are auto-generated the moment an order is dispatched —
// there's no freeform create/edit here, only recording what's been paid so
// far (the backend derives balance_due = amount - paidAmount and resolves
// status from it if not given explicitly).
export function InvoiceStatusModal({ open, onClose, invoice, onSubmit, isSubmitting }) {
  const [status, setStatus] = useState(PAYMENT_STATUS.UNPAID);
  const [paidAmount, setPaidAmount] = useState('');

  // Reset the fields from the selected invoice whenever the modal transitions
  // from closed to open — adjusted during render (not in an effect) per
  // React's "storing information from previous renders" pattern.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && invoice) {
      setStatus(invoice.status);
      setPaidAmount(String(Number(invoice.amount) - Number(invoice.balanceDue)));
    }
  }

  if (!invoice) return null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton
            loading={isSubmitting}
            onClick={() => onSubmit({ status, paidAmount: paidAmount === '' ? undefined : Number(paidAmount) })}
          >
            Save
          </AppButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          Total: ₹{Number(invoice.amount).toLocaleString('en-IN')} &nbsp;|&nbsp; Balance due: ₹
          {Number(invoice.balanceDue).toLocaleString('en-IN')}
        </p>
        <AppInput
          label="Amount received so far (₹)"
          type="number"
          step="0.01"
          value={paidAmount}
          onChange={(event) => setPaidAmount(event.target.value)}
        />
        <AppSelect label="Status" options={STATUS_OPTIONS} value={status} onChange={(event) => setStatus(event.target.value)} />
      </div>
    </AppModal>
  );
}
