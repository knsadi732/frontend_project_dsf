import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLoansQuery } from '@/features/loans/queries/useLoansQuery';
import { useCreateLoan } from '@/features/loans/mutations/useCreateLoan';
import { LoanTable } from '@/features/loans/components/LoanTable';
import { LoanFormModal } from '@/features/loans/components/LoanFormModal';
import { LoanDetailModal } from '@/features/loans/components/LoanDetailModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { LOAN_STATUS_OPTIONS } from '@/features/loans/validators/loan.schema';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Money borrowed by the company — principal, interest and outstanding balance.</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New loan
          </AppButton>
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

      <LoanTable
        loans={data?.data ?? []}
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
        onWriteOff={(loan) => setSelectedLoanId(loan.id)}
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
