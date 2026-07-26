import { useState } from 'react';
import { FileOutput, Send, SendHorizonal } from 'lucide-react';
import { usePurchaseRequestsQuery } from '@/features/purchaseRequests/queries/usePurchaseRequestsQuery';
import { useCreatePurchaseRequest } from '@/features/purchaseRequests/mutations/useCreatePurchaseRequest';
import { useUpdatePurchaseRequestStatus } from '@/features/purchaseRequests/mutations/useUpdatePurchaseRequestStatus';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { PurchaseRequestFormModal } from '@/features/purchaseRequests/components/PurchaseRequestFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { ApproveButton, RejectButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const PR_STATUS_VARIANT = {
  draft: 'default',
  submitted: 'warning',
  pending_approval: 'warning',
  pending: 'warning',
  approved: 'success',
  converted_to_rfq: 'success',
  rejected: 'danger',
};

export function PurchaseRequestsPanel({ onConvertToPo }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = usePurchaseRequestsQuery({ page, pageSize });
  // A converted PR has no dedicated status (backend's PATCH /status only
  // accepts approved/rejected) — so "already converted" is inferred from
  // whether a purchase order already references this PR's id.
  const { data: purchasesData } = usePurchasesQuery({ pageSize: 500 });
  const convertedRequestIds = new Set(
    (purchasesData?.data ?? []).map((po) => po.purchaseRequestId).filter(Boolean),
  );
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const { data: branchesData } = useBranchesQuery({ pageSize: 100 });
  const departments = departmentsData?.data ?? [];
  const warehouses = warehousesData?.data ?? [];
  const branches = branchesData?.data ?? [];
  const departmentsById = Object.fromEntries(departments.map((d) => [d.id, d]));
  const warehousesById = Object.fromEntries(warehouses.map((w) => [w.id, w]));
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  const createRequest = useCreatePurchaseRequest();
  const updateStatus = useUpdatePurchaseRequestStatus();

  const handleSubmit = (values) => {
    createRequest.mutateAsync(values).then(() => setFormOpen(false));
  };

  const columns = [
    { key: 'prNumber', header: 'PR Number' },
    { key: 'department', header: 'Department', render: (row) => departmentsById?.[row.departmentId]?.name ?? '—' },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'items', header: 'Items', render: (row) => row.items?.length ?? 0 },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={PR_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'draft' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
              <AppButton variant="primary" size="sm" title="Submit PR" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: row.id, status: 'submitted' }); }} aria-label="Submit PR">
                <Send className="size-4" />
              </AppButton>
            </Can>
          )}
          {row.status === 'submitted' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
              <AppButton variant="info" size="sm" title="Send for approval" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: row.id, status: 'pending_approval' }); }} aria-label="Send for approval">
                <SendHorizonal className="size-4" />
              </AppButton>
            </Can>
          )}
          {row.status === 'pending_approval' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
              <ApproveButton label="Approve PR" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: row.id, status: 'approved' }); }} />
              <RejectButton label="Reject PR" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: row.id, status: 'rejected' }); }} />
            </Can>
          )}
          {row.status === 'approved' && !convertedRequestIds.has(row.id) && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
              <AppButton variant="info" size="sm" title="Convert to Purchase Order" onClick={(e) => { e.stopPropagation(); onConvertToPo(row); }} aria-label="Convert to PO">
                <FileOutput className="size-4" />
              </AppButton>
            </Can>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Internal requests for materials — approve, then convert to a Purchase Order.</p>
        <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>New purchase request</CreateButton>
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
        emptyMessage="No purchase requests yet"
      />

      <PurchaseRequestFormModal
        open={formOpen}
        departmentOptions={departmentOptions}
        warehouseOptions={warehouseOptions}
        branchOptions={branchOptions}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createRequest.isPending}
      />
    </div>
  );
}
