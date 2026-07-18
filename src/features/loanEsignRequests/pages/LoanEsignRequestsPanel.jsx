import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLoanEsignRequestsQuery } from '@/features/loanEsignRequests/queries/useLoanEsignRequestsQuery';
import { useCreateLoanEsignRequest } from '@/features/loanEsignRequests/mutations/useCreateLoanEsignRequest';
import { LoanEsignRequestTable } from '@/features/loanEsignRequests/components/LoanEsignRequestTable';
import { LoanEsignRequestFormModal } from '@/features/loanEsignRequests/components/LoanEsignRequestFormModal';
import { LoanEsignLinkModal } from '@/features/loanEsignRequests/components/LoanEsignLinkModal';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

function buildEsignLink(token) {
  return `${window.location.origin}/esign/${token}`;
}

export function LoanEsignRequestsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  const { data, isLoading } = useLoanEsignRequestsQuery({ page, pageSize });
  const createRequest = useCreateLoanEsignRequest();

  const handleSubmit = (values) => {
    const token = crypto.randomUUID();
    createRequest.mutateAsync({ ...values, token, status: 'pending', createdDate: new Date().toISOString().slice(0, 10) }).then((record) => {
      setFormOpen(false);
      setActiveRequest({ ...record, link: buildEsignLink(token) });
    });
  };

  const handleRowClick = (row) => {
    if (row.status === 'pending') setActiveRequest({ ...row, link: buildEsignLink(row.token) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Loan agreements sent for e-signature — pending until the counter-party signs.</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New loan request
          </AppButton>
        </Can>
      </div>

      <LoanEsignRequestTable
        requests={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRowClick={handleRowClick}
      />

      <LoanEsignRequestFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createRequest.isPending}
      />

      <LoanEsignLinkModal open={Boolean(activeRequest)} onClose={() => setActiveRequest(null)} request={activeRequest} />
    </div>
  );
}
