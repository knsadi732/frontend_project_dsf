import { useState } from 'react';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useCreateWarehouse } from '@/features/warehouses/mutations/useCreateWarehouse';
import { useUpdateWarehouse } from '@/features/warehouses/mutations/useUpdateWarehouse';
import { useDeleteWarehouse } from '@/features/warehouses/mutations/useDeleteWarehouse';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { WarehouseFormModal } from '@/features/warehouses/components/WarehouseFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
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

  const columns = [
    { key: 'name', header: 'Warehouse', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'branch', header: 'Branch', render: (row) => branchesById?.[row.branchId]?.name ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, warehouse: row }); }} />
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.name}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Warehouses store inventory and belong to a branch.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, warehouse: null })}>New warehouse</CreateButton>
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
        onRowClick={(warehouse) => setFormState({ open: true, warehouse })}
        emptyMessage="No warehouses yet"
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
