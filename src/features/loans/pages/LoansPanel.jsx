import { useState } from 'react';
import { useLoansQuery } from '@/features/loans/queries/useLoansQuery';
import { useCreateLoan } from '@/features/loans/mutations/useCreateLoan';
import { LoanFormModal } from '@/features/loans/components/LoanFormModal';
import { LoanDetailModal } from '@/features/loans/components/LoanDetailModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppSelect } from '@/components/ui/AppSelect';
import { CancelButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { LOAN_STATUS_OPTIONS } from '@/features/loans/validators/loan.schema';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const LOAN_STATUS_VARIANT = { active: 'warning', closed: 'success', written_off: 'danger' };

export function LoansPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  const { data, isLoading } = useLoansQuery({ page, pageSize, status: status || undefined });
  const createLoan = useCreateLoan();

  const handleSubmit = (values) => {
    createLoan.mutateAsync(values).then(() => setFormOpen(false));
  };

  const columns = [
    { key: 'loanNumber', header: 'Loan #' },
    { key: 'lenderName', header: 'Lender', render: (row) => <span className="capitalize">{row.lenderName} <span className="text-text-muted">({row.lenderType})</span></span> },
    { key: 'principalAmount', header: 'Principal', render: (row) => `₹${row.principalAmount.toLocaleString('en-IN')}` },
    { key: 'interestRate', header: 'Interest', render: (row) => `${row.interestRate}% (${row.interestType})` },
    { key: 'startDate', header: 'Start date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={LOAN_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'active' && (
          <div className="flex justify-end">
            <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
              <CancelButton label="Write off loan" onClick={(e) => { e.stopPropagation(); setSelectedLoanId(row.id); }} />
            </Can>
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Money borrowed by the company — principal, interest and outstanding balance.</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>New loan</CreateButton>
        </Can>
      </div>

      <AppSelect
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          setPage(1);
        }}
        options={LOAN_STATUS_OPTIONS}
        placeholder="All statuses"
        className="w-48"
        aria-label="Filter by status"
      />

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
        onRowClick={(loan) => setSelectedLoanId(loan.id)}
        emptyMessage="No loans recorded yet"
      />

      <LoanFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createLoan.isPending}
      />

      {selectedLoanId && <LoanDetailModal loanId={selectedLoanId} onClose={() => setSelectedLoanId(null)} />}
    </div>
  );
}
