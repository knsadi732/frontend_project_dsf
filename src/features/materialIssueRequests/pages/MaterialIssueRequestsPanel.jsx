import { useMemo, useState } from 'react';
import { useMaterialIssueRequestsQuery } from '@/features/materialIssueRequests/queries/useMaterialIssueRequestsQuery';
import { useApproveMaterialIssueRequest } from '@/features/materialIssueRequests/mutations/useApproveMaterialIssueRequest';
import { useRejectMaterialIssueRequest } from '@/features/materialIssueRequests/mutations/useRejectMaterialIssueRequest';
import { useIssueMaterialIssueRequest } from '@/features/materialIssueRequests/mutations/useIssueMaterialIssueRequest';
import { MaterialIssueRequestDetailModal } from '@/features/materialIssueRequests/components/MaterialIssueRequestDetailModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ApproveButton, RejectButton, DownloadButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

const STATUS_OPTIONS = [
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'partially_issued', label: 'Partially Issued' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'issued', label: 'Issued' },
];

const MIR_STATUS_VARIANT = {
  pending_approval: 'warning',
  approved: 'success',
  partially_issued: 'warning',
  rejected: 'danger',
  issued: 'info',
};

function downloadRequisitionPdf(row) {
  generateRecordPdf({
    title: `Requisition Request - ${row.mirNumber}`,
    fields: [
      { label: 'Item', value: row.productName },
      { label: 'Department', value: row.requestedByDepartment },
      { label: 'Date of requisition', value: row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-' },
      { label: 'Date of issuance', value: row.issuedAt ? new Date(row.issuedAt).toLocaleDateString('en-IN') : '-' },
      { label: 'Created by', value: row.requestedByName },
      { label: 'Approved by', value: row.approvedByName },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.mirNumber}.pdf`,
  });
}

// Raised the instant a Work Order is created (BOM snapshot, nothing
// reserved yet) — waits here for the Production Manager to approve before
// warehouse/inventory ever sees it. Approval is the moment stock actually
// gets reserved and any shortfall raises a high-priority Purchase Request
// (see materialIssueRequest.service.js approve()).
// `defaultStatus` lets each host page open on the state relevant to that
// role — Production opens on "pending_approval" (Production Manager's
// queue), Inventory opens on "approved" (warehouse's issue queue) — same
// component, same data, just a different starting filter.
export function MaterialIssueRequestsPanel({ defaultStatus = 'pending_approval' }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [detailId, setDetailId] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, status, page, pageSize }),
    [debouncedSearch, status, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useMaterialIssueRequestsQuery(filters);
  const approveMir = useApproveMaterialIssueRequest();
  const rejectMir = useRejectMaterialIssueRequest();
  const issueMir = useIssueMaterialIssueRequest();

  // Modal stays open on success (not closed) so the just-submitted balance/
  // status updates are visible immediately — useful when there's more than
  // one partial hand-off happening in the same sitting.
  const handleIssue = (id, items) => {
    issueMir.mutate({ id, items });
  };

  const columns = [
    { key: 'mirNumber', header: 'Requisition Request #' },
    { key: 'productName', header: 'Item' },
    { key: 'requestedByDepartment', header: 'Department', render: (row) => row.requestedByDepartment || '—' },
    { key: 'createdAt', header: 'Date of Requisition', render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '—') },
    { key: 'issuedAt', header: 'Date of Issuance', render: (row) => (row.issuedAt ? new Date(row.issuedAt).toLocaleDateString('en-IN') : '—') },
    { key: 'requestedByName', header: 'Requisition Created By' },
    { key: 'approvedByName', header: 'Approved By', render: (row) => row.approvedByName || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={MIR_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton label={`Download ${row.mirNumber}`} onClick={(event) => { event.stopPropagation(); downloadRequisitionPdf(row); }} />
          {row.status === 'pending_approval' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
              <ApproveButton
                label="Approve"
                loading={approveMir.isPending}
                onClick={(event) => { event.stopPropagation(); approveMir.mutate(row.id); }}
              />
              <RejectButton
                label="Reject"
                loading={rejectMir.isPending}
                onClick={(event) => { event.stopPropagation(); rejectMir.mutate(row.id); }}
              />
            </Can>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Requisition requests raised automatically off each Work Order's Bill of Materials — approve to reserve
        available stock and auto-raise a Purchase Request for any shortfall, then open a request to Submit it as
        issued once the material actually leaves the warehouse for production.
      </p>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by requisition number…"
          className="w-72"
        />
        <MultiFilter
          filters={[{ key: 'status', label: 'Status', options: STATUS_OPTIONS }]}
          values={{ status }}
          onChange={(key, value) => {
            setStatus(value);
            setPage(1);
          }}
          onClear={() => {
            setStatus('');
            setPage(1);
          }}
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
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRowClick={(row) => setDetailId(row.id)}
        emptyMessage="No requisition requests yet"
      />

      <MaterialIssueRequestDetailModal
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        requestId={detailId}
        onIssue={handleIssue}
        isIssuing={issueMir.isPending}
      />
    </div>
  );
}
