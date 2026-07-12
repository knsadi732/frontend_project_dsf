import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProductionRequestsQuery } from '@/features/productionRequests/queries/useProductionRequestsQuery';
import { useCreateProductionRequest } from '@/features/productionRequests/mutations/useCreateProductionRequest';
import { useUpdateProductionRequest } from '@/features/productionRequests/mutations/useUpdateProductionRequest';
import { useDeleteProductionRequest } from '@/features/productionRequests/mutations/useDeleteProductionRequest';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { ProductionRequestTable } from '@/features/productionRequests/components/ProductionRequestTable';
import { ProductionRequestFormModal } from '@/features/productionRequests/components/ProductionRequestFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ProductionRequestsPanel({ onConvertToWorkOrder }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, request: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useProductionRequestsQuery({ page, pageSize });
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const products = productsData?.data ?? [];
  const warehouses = warehousesData?.data ?? [];
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const warehousesById = Object.fromEntries(warehouses.map((w) => [w.id, w]));
  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  const createRequest = useCreateProductionRequest();
  const updateRequest = useUpdateProductionRequest();
  const deleteRequest = useDeleteProductionRequest();

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
        <p className="text-sm text-text-muted">Internal production requests — approve, then convert to a Work Order.</p>
        <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, request: null })}>
            <Plus className="size-4" />
            New production request
          </AppButton>
        </Can>
      </div>

      <ProductionRequestTable
        requests={data?.data ?? []}
        productsById={productsById}
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
        onConvertToWorkOrder={onConvertToWorkOrder}
      />

      <ProductionRequestFormModal
        open={formState.open}
        initialValues={formState.request}
        productOptions={productOptions}
        warehouseOptions={warehouseOptions}
        onClose={() => setFormState({ open: false, request: null })}
        onSubmit={handleSubmit}
        isSubmitting={createRequest.isPending || updateRequest.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete production request"
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
