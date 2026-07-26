import { useState } from 'react';
import { useWarehouseZonesQuery } from '@/features/warehouseZones/queries/useWarehouseZonesQuery';
import { useCreateWarehouseZone } from '@/features/warehouseZones/mutations/useCreateWarehouseZone';
import { useUpdateWarehouseZone } from '@/features/warehouseZones/mutations/useUpdateWarehouseZone';
import { useDeleteWarehouseZone } from '@/features/warehouseZones/mutations/useDeleteWarehouseZone';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { WarehouseZoneFormModal } from '@/features/warehouseZones/components/WarehouseZoneFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
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

  const columns = [
    { key: 'name', header: 'Zone', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'zoneType', header: 'Type', render: (row) => <span className="capitalize">{row.zoneType}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, zone: row }); }} />
          </Can>
          <Can module={MODULES.INVENTORY} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.name}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Zones divide each warehouse into operational areas.</p>
        <Can module={MODULES.INVENTORY} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, zone: null })}>New zone</CreateButton>
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
        onRowClick={(zone) => setFormState({ open: true, zone })}
        emptyMessage="No zones yet"
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
