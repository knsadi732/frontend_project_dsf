import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWarehouseZonesQuery } from '@/features/warehouseZones/queries/useWarehouseZonesQuery';
import { useCreateWarehouseZone } from '@/features/warehouseZones/mutations/useCreateWarehouseZone';
import { useUpdateWarehouseZone } from '@/features/warehouseZones/mutations/useUpdateWarehouseZone';
import { useDeleteWarehouseZone } from '@/features/warehouseZones/mutations/useDeleteWarehouseZone';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { WarehouseZoneTable } from '@/features/warehouseZones/components/WarehouseZoneTable';
import { WarehouseZoneFormModal } from '@/features/warehouseZones/components/WarehouseZoneFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function WarehouseZonesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, zone: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useWarehouseZonesQuery({ page, pageSize });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouses = warehousesData?.data ?? [];
  const warehousesById = Object.fromEntries(warehouses.map((w) => [w.id, w]));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  const createZone = useCreateWarehouseZone();
  const updateZone = useUpdateWarehouseZone();
  const deleteZone = useDeleteWarehouseZone();

  const handleSubmit = (values) => {
    const action = formState.zone
      ? updateZone.mutateAsync({ id: formState.zone.id, payload: values })
      : createZone.mutateAsync(values);

    action.then(() => setFormState({ open: false, zone: null }));
  };

  const handleConfirmDelete = () => {
    deleteZone.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Zones divide each warehouse into operational areas.</p>
        <Can module={MODULES.INVENTORY} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, zone: null })}>
            <Plus className="size-4" />
            New zone
          </AppButton>
        </Can>
      </div>

      <WarehouseZoneTable
        zones={data?.data ?? []}
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
        onEdit={(zone) => setFormState({ open: true, zone })}
        onDelete={setDeleteTarget}
      />

      <WarehouseZoneFormModal
        open={formState.open}
        initialValues={formState.zone}
        warehouseOptions={warehouseOptions}
        onClose={() => setFormState({ open: false, zone: null })}
        onSubmit={handleSubmit}
        isSubmitting={createZone.isPending || updateZone.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete zone"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteZone.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.name}</span>? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
