import { useState } from 'react';
import { Ban } from 'lucide-react';
import { usePayableQuery } from '@/features/payables/queries/usePayableQuery';
import { usePayablePaymentsQuery } from '@/features/payables/queries/usePayablePaymentsQuery';
import { useCreatePayablePayment } from '@/features/payables/mutations/useCreatePayablePayment';
import { useWriteOffPayable } from '@/features/payables/mutations/useWriteOffPayable';
import { PayablePaymentFormModal } from '@/features/payables/components/PayablePaymentFormModal';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = { pending: 'warning', partial: 'warning', paid: 'success', written_off: 'danger' };

export function PayableDetailModal({ payableId, onClose }) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { data: payable, isLoading } = usePayableQuery(payableId);
  const { data: payments = [] } = usePayablePaymentsQuery(payableId);
  const createPayment = useCreatePayablePayment(payableId);
  const writeOffPayable = useWriteOffPayable();

  const isOpen = payable?.status === 'pending' || payable?.status === 'partial';

  const handlePaymentSubmit = (values) => {
    createPayment.mutateAsync(values).then(() => setPaymentOpen(false));
  };

  const paymentColumns = [
    { key: 'paidAt', header: 'Paid on', render: (row) => (row.paidAt ? new Date(row.paidAt).toLocaleDateString('en-IN') : '—') },
    { key: 'amount', header: 'Amount', render: (row) => `₹${row.amount.toLocaleString('en-IN')}` },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
  ];

  return (
    <AppModal
      open={Boolean(payableId)}
      onClose={onClose}
      title={payable ? `Payable ${payable.payableNumber}` : 'Payable'}
      className="max-w-3xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Close
          </AppButton>
          {isOpen && (
            <>
              <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
                <AppButton
                  variant="danger"
                  loading={writeOffPayable.isPending}
                  onClick={() => writeOffPayable.mutate(payableId)}
                >
                  <Ban className="size-4" />
                  Write off
                </AppButton>
              </Can>
              <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
                <CreateButton onClick={() => setPaymentOpen(true)}>Record payment</CreateButton>
              </Can>
            </>
          )}
        </>
      }
    >
      {isLoading || !payable ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-text-muted">Party</p>
              <p className="text-sm font-medium text-text">{payable.partyName}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Purpose</p>
              <p className="text-sm font-medium text-text">{payable.purpose}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Total amount</p>
              <p className="text-sm font-medium text-text">₹{payable.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <StatusBadge status={payable.status} variantMap={STATUS_VARIANT} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Paid so far</p>
              <p className="text-sm font-medium text-success">₹{payable.amountPaid.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Amount due</p>
              <p className="text-sm font-bold text-text">₹{payable.amountDue.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text">Payment history</p>
            <AppTable columns={paymentColumns} data={payments} emptyMessage="No payments recorded yet" />
          </div>
        </div>
      )}

      <PayablePaymentFormModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handlePaymentSubmit}
        isSubmitting={createPayment.isPending}
      />
    </AppModal>
  );
}
