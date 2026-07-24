import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePurchaseRequestsQuery } from '@/features/purchaseRequests/queries/usePurchaseRequestsQuery';
import { useCreatePurchaseRequest } from '@/features/purchaseRequests/mutations/useCreatePurchaseRequest';
import { useUpdatePurchaseRequestStatus } from '@/features/purchaseRequests/mutations/useUpdatePurchaseRequestStatus';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { PurchaseRequestTable } from '@/features/purchaseRequests/components/PurchaseRequestTable';
import { PurchaseRequestFormModal } from '@/features/purchaseRequests/components/PurchaseRequestFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function PurchaseRequestsPanel({ onConvertToPo }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = usePurchaseRequestsQuery({ page, pageSize });
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Internal requests for materials — approve, then convert to a Purchase Order.</p>
        <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New purchase request
          </AppButton>
        </Can>
      </div>

      <PurchaseRequestTable
        requests={data?.data ?? []}
        departmentsById={departmentsById}
        warehousesById={warehousesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onApprove={(request) => updateStatus.mutate({ id: request.id, status: 'approved' })}
        onReject={(request) => updateStatus.mutate({ id: request.id, status: 'rejected' })}
        onConvertToPo={onConvertToPo}
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
