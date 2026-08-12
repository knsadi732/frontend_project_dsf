import { useMemo, useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { useMaterialIssueRequestsQuery } from '@/features/materialIssueRequests/queries/useMaterialIssueRequestsQuery';
import { useApproveMaterialIssueRequest } from '@/features/materialIssueRequests/mutations/useApproveMaterialIssueRequest';
import { useRejectMaterialIssueRequest } from '@/features/materialIssueRequests/mutations/useRejectMaterialIssueRequest';
import { useIssueMaterialIssueRequest } from '@/features/materialIssueRequests/mutations/useIssueMaterialIssueRequest';
import { MaterialIssueRequestDetailModal } from '@/features/materialIssueRequests/components/MaterialIssueRequestDetailModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ApproveButton, RejectButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_OPTIONS = [
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'issued', label: 'Issued' },
];

const MIR_STATUS_VARIANT = {
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  issued: 'info',
};

// Raised the instant a Work Order is created (BOM snapshot, nothing
// reserved yet) — waits here for the Production Manager to approve before
// warehouse/inventory ever sees it. Approval is the moment stock actually
// gets reserved and any shortfall raises a high-priority Purchase Request
// (see materialIssueRequest.service.js approve()).
export function MaterialIssueRequestsPanel() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending_approval');
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

  const columns = [
    { key: 'mirNumber', header: 'MIR #' },
    { key: 'workOrderNumber', header: 'Work Order' },
    { key: 'productName', header: 'Product' },
    { key: 'warehouseName', header: 'Warehouse' },
    { key: 'requestedByName', header: 'Requested By' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={MIR_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
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
          {row.status === 'approved' && (
            <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
              <AppButton
                variant="success"
                size="sm"
                loading={issueMir.isPending}
                onClick={(event) => { event.stopPropagation(); issueMir.mutate(row.id); }}
                aria-label={`Mark ${row.mirNumber} as issued`}
                title="Mark issued — deducts on-hand stock"
              >
                <PackageCheck className="size-4" />
              </AppButton>
            </Can>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Raw material requests raised automatically off each Work Order's Bill of Materials — approve to reserve
        available stock and auto-raise a Purchase Request for any shortfall, then mark issued once the material
        actually leaves the warehouse for production.
      </p>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by MIR number…"
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
        emptyMessage="No material issue requests yet"
      />

      <MaterialIssueRequestDetailModal open={Boolean(detailId)} onClose={() => setDetailId(null)} requestId={detailId} />
    </div>
  );
}
