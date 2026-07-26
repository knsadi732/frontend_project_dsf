import { useState } from 'react';
import { useBinsQuery } from '@/features/bins/queries/useBinsQuery';
import { useCreateBin } from '@/features/bins/mutations/useCreateBin';
import { useUpdateBin } from '@/features/bins/mutations/useUpdateBin';
import { useDeleteBin } from '@/features/bins/mutations/useDeleteBin';
import { useShelvesQuery } from '@/features/shelves/queries/useShelvesQuery';
import { BinTable } from '@/features/bins/components/BinTable';
import { BinFormModal } from '@/features/bins/components/BinFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function BinsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, bin: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useBinsQuery({ page, pageSize });
  const { data: shelvesData } = useShelvesQuery({ pageSize: 100 });
  const shelves = shelvesData?.data ?? [];
  const shelvesById = Object.fromEntries(shelves.map((s) => [s.id, s]));
  const shelfOptions = shelves.map((s) => ({ value: s.id, label: s.code }));

  const createBin = useCreateBin();
  const updateBin = useUpdateBin();
  const deleteBin = useDeleteBin();

  const handleSubmit = (values) => {
    const action = formState.bin
      ? updateBin.mutateAsync({ id: formState.bin.id, payload: values })
      : createBin.mutateAsync(values);

    action.then(() => setFormState({ open: false, bin: null }));
  };

  const handleConfirmDelete = () => {
    deleteBin.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Bins are the smallest physical storage unit — every inventory movement references a bin.</p>
        <Can module={MODULES.INVENTORY} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, bin: null })}>New bin</CreateButton>
        </Can>
      </div>

      <BinTable
        bins={data?.data ?? []}
        shelvesById={shelvesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(bin) => setFormState({ open: true, bin })}
        onDelete={setDeleteTarget}
      />

      <BinFormModal
        open={formState.open}
        initialValues={formState.bin}
        shelfOptions={shelfOptions}
        onClose={() => setFormState({ open: false, bin: null })}
        onSubmit={handleSubmit}
        isSubmitting={createBin.isPending || updateBin.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete bin"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteBin.isPending} onClick={handleConfirmDelete}>
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
