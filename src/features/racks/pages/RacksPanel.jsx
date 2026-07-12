import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRacksQuery } from '@/features/racks/queries/useRacksQuery';
import { useCreateRack } from '@/features/racks/mutations/useCreateRack';
import { useUpdateRack } from '@/features/racks/mutations/useUpdateRack';
import { useDeleteRack } from '@/features/racks/mutations/useDeleteRack';
import { useWarehouseZonesQuery } from '@/features/warehouseZones/queries/useWarehouseZonesQuery';
import { RackTable } from '@/features/racks/components/RackTable';
import { RackFormModal } from '@/features/racks/components/RackFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function RacksPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, rack: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useRacksQuery({ page, pageSize });
  const { data: zonesData } = useWarehouseZonesQuery({ pageSize: 100 });
  const zones = zonesData?.data ?? [];
  const zonesById = Object.fromEntries(zones.map((z) => [z.id, z]));
  const zoneOptions = zones.map((z) => ({ value: z.id, label: z.name }));

  const createRack = useCreateRack();
  const updateRack = useUpdateRack();
  const deleteRack = useDeleteRack();

  const handleSubmit = (values) => {
    const action = formState.rack
      ? updateRack.mutateAsync({ id: formState.rack.id, payload: values })
      : createRack.mutateAsync(values);

    action.then(() => setFormState({ open: false, rack: null }));
  };

  const handleConfirmDelete = () => {
    deleteRack.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Racks belong to a zone.</p>
        <Can module={MODULES.INVENTORY} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, rack: null })}>
            <Plus className="size-4" />
            New rack
          </AppButton>
        </Can>
      </div>

      <RackTable
        racks={data?.data ?? []}
        zonesById={zonesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(rack) => setFormState({ open: true, rack })}
        onDelete={setDeleteTarget}
      />

      <RackFormModal
        open={formState.open}
        initialValues={formState.rack}
        zoneOptions={zoneOptions}
        onClose={() => setFormState({ open: false, rack: null })}
        onSubmit={handleSubmit}
        isSubmitting={createRack.isPending || updateRack.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete rack"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteRack.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.code}</span>? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
