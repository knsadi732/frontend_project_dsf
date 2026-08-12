import { useState } from 'react';
import { FileOutput, Send, SendHorizonal } from 'lucide-react';
import { usePurchaseRequestsQuery } from '@/features/purchaseRequests/queries/usePurchaseRequestsQuery';
import { useCreatePurchaseRequest } from '@/features/purchaseRequests/mutations/useCreatePurchaseRequest';
import { useUpdatePurchaseRequestStatus } from '@/features/purchaseRequests/mutations/useUpdatePurchaseRequestStatus';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { PurchaseRequestFormModal } from '@/features/purchaseRequests/components/PurchaseRequestFormModal';
import { RfqFormModal } from '@/features/rfqs';
import { useCreateRfq } from '@/features/rfqs/mutations/useCreateRfq';
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

export function PurchaseRequestsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);
  const [rfqFormState, setRfqFormState] = useState({ open: false, purchaseRequest: null });

  const { data, isLoading } = usePurchaseRequestsQuery({ page, pageSize });
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const { data: branchesData } = useBranchesQuery({ pageSize: 100 });
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const departments = departmentsData?.data ?? [];
  const warehouses = warehousesData?.data ?? [];
  const branches = branchesData?.data ?? [];
  const departmentsById = Object.fromEntries(departments.map((d) => [d.id, d]));
  const warehousesById = Object.fromEntries(warehouses.map((w) => [w.id, w]));
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));
  const vendorOptions = (vendorsData?.data ?? []).map((v) => ({ value: v.id, label: v.name }));

  const createRequest = useCreatePurchaseRequest();
  const updateStatus = useUpdatePurchaseRequestStatus();
  const createRfq = useCreateRfq();

  const handleSubmit = (values) => {
    createRequest.mutateAsync(values).then(() => setFormOpen(false));
  };

  const handleCreateRfq = (values) => {
    createRfq.mutateAsync(values).then(() => setRfqFormState({ open: false, purchaseRequest: null }));
  };

  const columns = [
    { key: 'prNumber', header: 'PR Number' },
    { key: 'department', header: 'Department', render: (row) => departmentsById?.[row.departmentId]?.name ?? '—' },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'priority', header: 'Priority', render: (row) => row.priority ? row.priority.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Medium' },
    { key: 'requiredDate', header: 'Required Date', render: (row) => row.requiredDate || '—' },
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
          {row.status === 'approved' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
              <AppButton variant="info" size="sm" title="Create RFQ" onClick={(e) => { e.stopPropagation(); setRfqFormState({ open: true, purchaseRequest: row }); }} aria-label="Create RFQ">
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
        <p className="text-sm text-text-muted">Internal requests for materials — approve, then raise an RFQ to compare vendors before ordering.</p>
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

      <RfqFormModal
        open={rfqFormState.open}
        purchaseRequest={rfqFormState.purchaseRequest}
        vendorOptions={vendorOptions}
        onClose={() => setRfqFormState({ open: false, purchaseRequest: null })}
        onSubmit={handleCreateRfq}
        isSubmitting={createRfq.isPending}
      />
    </div>
  );
}
