import { useState } from 'react';
import { useLoanEsignRequestsQuery } from '@/features/loanEsignRequests/queries/useLoanEsignRequestsQuery';
import { useCreateLoanEsignRequest } from '@/features/loanEsignRequests/mutations/useCreateLoanEsignRequest';
import { LoanEsignRequestFormModal } from '@/features/loanEsignRequests/components/LoanEsignRequestFormModal';
import { LoanEsignLinkModal } from '@/features/loanEsignRequests/components/LoanEsignLinkModal';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const ESIGN_STATUS_LABEL = { pending: 'Pending', signed: 'eSign Verified' };
const ESIGN_STATUS_VARIANT = { pending: 'warning', signed: 'success' };

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

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

  const columns = [
    { key: 'partyName', header: 'Party' },
    { key: 'email', header: 'Email' },
    { key: 'loanAmount', header: 'Loan Amount', render: (row) => `₹${Number(row.loanAmount).toLocaleString('en-IN')}` },
    { key: 'interestRatePercent', header: 'Interest', render: (row) => `${row.interestRatePercent}%` },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={ESIGN_STATUS_VARIANT[row.status] ?? 'default'}>{ESIGN_STATUS_LABEL[row.status] ?? row.status}</BaseBadge>,
    },
    { key: 'signerName', header: 'Signed By', render: (row) => row.signerName || '—' },
    { key: 'signedAt', header: 'Signed At', render: (row) => formatDateTime(row.signedAt) },
    { key: 'createdDate', header: 'Sent On' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Loan agreements sent for e-signature — pending until the counter-party signs.</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>New loan request</CreateButton>
        </Can>
      </div>

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
        onRowClick={handleRowClick}
        emptyMessage="No loan e-sign requests yet"
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
