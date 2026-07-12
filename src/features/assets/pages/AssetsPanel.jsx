import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAssetsQuery } from '@/features/assets/queries/useAssetsQuery';
import { useCreateAsset } from '@/features/assets/mutations/useCreateAsset';
import { useUpdateAsset } from '@/features/assets/mutations/useUpdateAsset';
import { useDeleteAsset } from '@/features/assets/mutations/useDeleteAsset';
import { AssetTable } from '@/features/assets/components/AssetTable';
import { AssetFormModal } from '@/features/assets/components/AssetFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function AssetsPanel({ employeesById, employeeOptions }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, asset: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useAssetsQuery({ page, pageSize });
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const handleSubmit = (values) => {
    const action = formState.asset
      ? updateAsset.mutateAsync({ id: formState.asset.id, payload: values })
      : createAsset.mutateAsync(values);

    action.then(() => setFormState({ open: false, asset: null }));
  };

  const handleConfirmDelete = () => {
    deleteAsset.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Company assets assigned to employees.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, asset: null })}>
            <Plus className="size-4" />
            New assignment
          </AppButton>
        </Can>
      </div>

      <AssetTable
        assets={data?.data ?? []}
        employeesById={employeesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(asset) => setFormState({ open: true, asset })}
        onDelete={setDeleteTarget}
      />

      <AssetFormModal
        open={formState.open}
        initialValues={formState.asset}
        employeeOptions={employeeOptions}
        onClose={() => setFormState({ open: false, asset: null })}
        onSubmit={handleSubmit}
        isSubmitting={createAsset.isPending || updateAsset.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete asset"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteAsset.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete this asset record? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
