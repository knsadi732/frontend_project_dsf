import { useState } from 'react';
import { useShelvesQuery } from '@/features/shelves/queries/useShelvesQuery';
import { useCreateShelf } from '@/features/shelves/mutations/useCreateShelf';
import { useUpdateShelf } from '@/features/shelves/mutations/useUpdateShelf';
import { useDeleteShelf } from '@/features/shelves/mutations/useDeleteShelf';
import { useRacksQuery } from '@/features/racks/queries/useRacksQuery';
import { ShelfFormModal } from '@/features/shelves/components/ShelfFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ShelvesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, shelf: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useShelvesQuery({ page, pageSize });
  const { data: racksData } = useRacksQuery({ pageSize: 100 });
  const racks = racksData?.data ?? [];
  const racksById = Object.fromEntries(racks.map((r) => [r.id, r]));
  const rackOptions = racks.map((r) => ({ value: r.id, label: r.code }));

  const createShelf = useCreateShelf();
  const updateShelf = useUpdateShelf();
  const deleteShelf = useDeleteShelf();

  const handleSubmit = (values) => {
    const action = formState.shelf
      ? updateShelf.mutateAsync({ id: formState.shelf.id, payload: values })
      : createShelf.mutateAsync(values);

    action.then(() => setFormState({ open: false, shelf: null }));
  };

  const handleConfirmDelete = () => {
    deleteShelf.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'code', header: 'Shelf', render: (row) => <span className="font-medium text-text">{row.code}</span> },
    { key: 'rack', header: 'Rack', render: (row) => racksById?.[row.rackId]?.code ?? '—' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.code}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, shelf: row }); }} />
          </Can>
          <Can module={MODULES.INVENTORY} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.code}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Shelves belong to a rack.</p>
        <Can module={MODULES.INVENTORY} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, shelf: null })}>New shelf</CreateButton>
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
        onRowClick={(shelf) => setFormState({ open: true, shelf })}
        emptyMessage="No shelves yet"
      />

      <ShelfFormModal
        open={formState.open}
        initialValues={formState.shelf}
        rackOptions={rackOptions}
        onClose={() => setFormState({ open: false, shelf: null })}
        onSubmit={handleSubmit}
        isSubmitting={createShelf.isPending || updateShelf.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete shelf"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteShelf.isPending} onClick={handleConfirmDelete}>
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
