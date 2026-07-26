import { useState } from 'react';
import { FileOutput } from 'lucide-react';
import { useProductionRequestsQuery } from '@/features/productionRequests/queries/useProductionRequestsQuery';
import { useCreateProductionRequest } from '@/features/productionRequests/mutations/useCreateProductionRequest';
import { useUpdateProductionRequest } from '@/features/productionRequests/mutations/useUpdateProductionRequest';
import { useDeleteProductionRequest } from '@/features/productionRequests/mutations/useDeleteProductionRequest';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { ProductionRequestFormModal } from '@/features/productionRequests/components/ProductionRequestFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { ApproveButton, RejectButton, EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const PRODUCTION_REQUEST_STATUS_VARIANT = {
  draft: 'default',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  converted_to_production_order: 'success',
};

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

  const columns = [
    { key: 'prNumber', header: 'PR Number' },
    { key: 'product', header: 'Product', render: (row) => productsById?.[row.productId]?.name ?? '—' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'requiredDate', header: 'Required date' },
    { key: 'priority', header: 'Priority', render: (row) => <span className="capitalize">{row.priority}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={PRODUCTION_REQUEST_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'pending_approval' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
              <ApproveButton label="Approve PR" onClick={(e) => { e.stopPropagation(); updateRequest.mutate({ id: row.id, payload: { status: 'approved' } }); }} />
              <RejectButton label="Reject PR" onClick={(e) => { e.stopPropagation(); updateRequest.mutate({ id: row.id, payload: { status: 'rejected' } }); }} />
            </Can>
          )}
          {row.status === 'approved' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onConvertToWorkOrder(row); }} aria-label="Convert to work order" title="Convert to work order">
                <FileOutput className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            <EditButton label="Edit PR" onClick={(e) => { e.stopPropagation(); setFormState({ open: true, request: row }); }} />
          </Can>
          <Can module={MODULES.PRODUCTION} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete PR" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Internal production requests — approve, then convert to a Work Order.</p>
        <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, request: null })}>New production request</CreateButton>
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
        onRowClick={(request) => setFormState({ open: true, request })}
        emptyMessage="No production requests yet"
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
