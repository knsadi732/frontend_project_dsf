import { useState } from 'react';
import { useApprovalRequestsQuery } from '@/features/approvalRequests/queries/useApprovalRequestsQuery';
import { useApproveApprovalRequest } from '@/features/approvalRequests/mutations/useApproveApprovalRequest';
import { useRejectApprovalRequest } from '@/features/approvalRequests/mutations/useRejectApprovalRequest';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { FilterBar } from '@/components/ui/FilterBar';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ApproveButton, RejectButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_OPTIONS = [
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const REQUEST_TYPE_LABEL = { vendor_payment: 'Vendor Payment', credit_limit_override: 'Credit Limit Override' };

// One-click approval queue for Owner/Superadmin — vendor payments and
// customer credit-limit overrides both land here pending_approval; approving
// executes the real action (posts the payment / changes the limit) in the
// same step (approvalRequest.service.js approve()).
export function ApprovalRequestsPanel() {
  const [status, setStatus] = useState('pending_approval');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, refetch } = useApprovalRequestsQuery({ status, page, pageSize });
  const approveRequest = useApproveApprovalRequest();
  const rejectRequest = useRejectApprovalRequest();

  const columns = [
    { key: 'requestType', header: 'Type', render: (row) => <BaseBadge variant="info">{REQUEST_TYPE_LABEL[row.requestType] ?? row.requestType}</BaseBadge> },
    {
      key: 'details',
      header: 'Details',
      render: (row) =>
        row.requestType === 'vendor_payment'
          ? `₹${Number(row.payload?.amount ?? 0).toLocaleString('en-IN')} · UTR ${row.payload?.utrNumber ?? '—'}`
          : `New limit: ₹${Number(row.payload?.requestedLimit ?? 0).toLocaleString('en-IN')}`,
    },
    { key: 'requestedByName', header: 'Requested By' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'pending_approval' && (
          <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
            <div className="flex justify-end gap-1">
              <ApproveButton label="Approve" loading={approveRequest.isPending} onClick={() => approveRequest.mutate(row.id)} />
              <RejectButton label="Reject" loading={rejectRequest.isPending} onClick={() => rejectRequest.mutate(row.id)} />
            </div>
          </Can>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        High-value vendor payments and customer credit-limit overrides, waiting for a one-click Owner decision.
      </p>

      <FilterBar>
        <MultiFilter
          filters={[{ key: 'status', label: 'Status', options: STATUS_OPTIONS }]}
          values={{ status }}
          onChange={(key, value) => { setStatus(value); setPage(1); }}
          onClear={() => { setStatus(''); setPage(1); }}
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

      <AppTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No approval requests"
      />
    </div>
  );
}
