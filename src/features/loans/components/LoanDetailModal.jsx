import { useState } from 'react';
import { Ban } from 'lucide-react';
import { useLoanQuery } from '@/features/loans/queries/useLoanQuery';
import { useLoanRepaymentsQuery } from '@/features/loans/queries/useLoanRepaymentsQuery';
import { useCreateRepayment } from '@/features/loans/mutations/useCreateRepayment';
import { useWriteOffLoan } from '@/features/loans/mutations/useWriteOffLoan';
import { RepaymentFormModal } from '@/features/loans/components/RepaymentFormModal';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = { active: 'warning', closed: 'success', written_off: 'danger' };

export function LoanDetailModal({ loanId, onClose }) {
  const [repaymentOpen, setRepaymentOpen] = useState(false);
  const { data: loan, isLoading } = useLoanQuery(loanId);
  const { data: repayments = [] } = useLoanRepaymentsQuery(loanId);
  const createRepayment = useCreateRepayment(loanId);
  const writeOffLoan = useWriteOffLoan();

  const handleRepaymentSubmit = (values) => {
    createRepayment.mutateAsync(values).then(() => setRepaymentOpen(false));
  };

  const repaymentColumns = [
    { key: 'paidAt', header: 'Paid on', render: (row) => (row.paidAt ? new Date(row.paidAt).toLocaleDateString('en-IN') : '—') },
    { key: 'amount', header: 'Amount', render: (row) => `₹${row.amount.toLocaleString('en-IN')}` },
    { key: 'principalComponent', header: 'Principal', render: (row) => `₹${row.principalComponent.toLocaleString('en-IN')}` },
    { key: 'interestComponent', header: 'Interest', render: (row) => `₹${row.interestComponent.toLocaleString('en-IN')}` },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
  ];

  return (
    <AppModal
      open={Boolean(loanId)}
      onClose={onClose}
      title={loan ? `Loan ${loan.loanNumber}` : 'Loan'}
      className="max-w-3xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Close
          </AppButton>
          {loan?.status === 'active' && (
            <>
              <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
                <AppButton
                  variant="danger"
                  loading={writeOffLoan.isPending}
                  onClick={() => writeOffLoan.mutate(loanId)}
                >
                  <Ban className="size-4" />
                  Write off
                </AppButton>
              </Can>
              <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
                <CreateButton onClick={() => setRepaymentOpen(true)}>Record repayment</CreateButton>
              </Can>
            </>
          )}
        </>
      }
    >
      {isLoading || !loan ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-text-muted">Lender</p>
              <p className="text-sm font-medium text-text capitalize">{loan.lenderName} ({loan.lenderType})</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Principal</p>
              <p className="text-sm font-medium text-text">₹{loan.principalAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Interest</p>
              <p className="text-sm font-medium text-text">{loan.interestRate}% ({loan.interestType})</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <StatusBadge status={loan.status} variantMap={STATUS_VARIANT} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Repaid (principal)</p>
              <p className="text-sm font-medium text-success">₹{(loan.repaidPrincipal ?? 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Outstanding balance</p>
              <p className="text-sm font-bold text-text">₹{(loan.outstandingBalance ?? 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text">Repayment history</p>
            <AppTable columns={repaymentColumns} data={repayments} emptyMessage="No repayments recorded yet" />
          </div>
        </div>
      )}

      <RepaymentFormModal
        open={repaymentOpen}
        onClose={() => setRepaymentOpen(false)}
        onSubmit={handleRepaymentSubmit}
        isSubmitting={createRepayment.isPending}
      />
    </AppModal>
  );
}
