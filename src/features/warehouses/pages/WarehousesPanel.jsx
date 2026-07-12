import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useCreateWarehouse } from '@/features/warehouses/mutations/useCreateWarehouse';
import { useUpdateWarehouse } from '@/features/warehouses/mutations/useUpdateWarehouse';
import { useDeleteWarehouse } from '@/features/warehouses/mutations/useDeleteWarehouse';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { WarehouseTable } from '@/features/warehouses/components/WarehouseTable';
import { WarehouseFormModal } from '@/features/warehouses/components/WarehouseFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function WarehousesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, warehouse: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useWarehousesQuery({ page, pageSize });
  const { data: branchesData } = useBranchesQuery({ pageSize: 100 });
  const branches = branchesData?.data ?? [];
  const branchesById = Object.fromEntries(branches.map((branch) => [branch.id, branch]));
  const branchOptions = branches.map((branch) => ({ value: branch.id, label: branch.name }));

  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();

  const handleSubmit = (values) => {
    const action = formState.warehouse
      ? updateWarehouse.mutateAsync({ id: formState.warehouse.id, payload: values })
      : createWarehouse.mutateAsync(values);

    action.then(() => setFormState({ open: false, warehouse: null }));
  };

  const handleConfirmDelete = () => {
    deleteWarehouse.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Warehouses store inventory and belong to a branch.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, warehouse: null })}>
            <Plus className="size-4" />
            New warehouse
          </AppButton>
        </Can>
      </div>

      <WarehouseTable
        warehouses={data?.data ?? []}
        branchesById={branchesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(warehouse) => setFormState({ open: true, warehouse })}
        onDelete={setDeleteTarget}
      />

      <WarehouseFormModal
        open={formState.open}
        initialValues={formState.warehouse}
        branchOptions={branchOptions}
        onClose={() => setFormState({ open: false, warehouse: null })}
        onSubmit={handleSubmit}
        isSubmitting={createWarehouse.isPending || updateWarehouse.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete warehouse"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteWarehouse.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.name}</span>? This
          action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
