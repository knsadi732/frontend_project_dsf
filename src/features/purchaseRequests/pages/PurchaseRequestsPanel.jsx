import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePurchaseRequestsQuery } from '@/features/purchaseRequests/queries/usePurchaseRequestsQuery';
import { useCreatePurchaseRequest } from '@/features/purchaseRequests/mutations/useCreatePurchaseRequest';
import { useUpdatePurchaseRequest } from '@/features/purchaseRequests/mutations/useUpdatePurchaseRequest';
import { useDeletePurchaseRequest } from '@/features/purchaseRequests/mutations/useDeletePurchaseRequest';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { PurchaseRequestTable } from '@/features/purchaseRequests/components/PurchaseRequestTable';
import { PurchaseRequestFormModal } from '@/features/purchaseRequests/components/PurchaseRequestFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function PurchaseRequestsPanel({ onConvertToPo }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, request: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = usePurchaseRequestsQuery({ page, pageSize });
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const departments = departmentsData?.data ?? [];
  const warehouses = warehousesData?.data ?? [];
  const departmentsById = Object.fromEntries(departments.map((d) => [d.id, d]));
  const warehousesById = Object.fromEntries(warehouses.map((w) => [w.id, w]));
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  const createRequest = useCreatePurchaseRequest();
  const updateRequest = useUpdatePurchaseRequest();
  const deleteRequest = useDeletePurchaseRequest();

  const handleSubmit = (values) => {
    const action = formState.request
      ? updateRequest.mutateAsync({ id: formState.request.id, payload: values })
      : createRequest.mutateAsync(values);

    action.then(() => setFormState({ open: false, request: null }));
  };

  const handleConfirmDelete = () => {
    deleteRequest.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Internal requests for materials — approve, then convert to a Purchase Order.</p>
        <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, request: null })}>
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
        onEdit={(request) => setFormState({ open: true, request })}
        onDelete={setDeleteTarget}
        onApprove={(request) => updateRequest.mutate({ id: request.id, payload: { status: 'approved' } })}
        onReject={(request) => updateRequest.mutate({ id: request.id, payload: { status: 'rejected' } })}
        onConvertToPo={onConvertToPo}
      />

      <PurchaseRequestFormModal
        open={formState.open}
        initialValues={formState.request}
        departmentOptions={departmentOptions}
        warehouseOptions={warehouseOptions}
        onClose={() => setFormState({ open: false, request: null })}
        onSubmit={handleSubmit}
        isSubmitting={createRequest.isPending || updateRequest.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete purchase request"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteRequest.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.prNumber}</span>? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
