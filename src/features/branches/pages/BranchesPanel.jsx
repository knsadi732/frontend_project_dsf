import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useCreateBranch } from '@/features/branches/mutations/useCreateBranch';
import { useUpdateBranch } from '@/features/branches/mutations/useUpdateBranch';
import { useDeleteBranch } from '@/features/branches/mutations/useDeleteBranch';
import { BranchTable } from '@/features/branches/components/BranchTable';
import { BranchFormModal } from '@/features/branches/components/BranchFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function BranchesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, branch: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useBranchesQuery({ page, pageSize });
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const handleSubmit = (values) => {
    const action = formState.branch
      ? updateBranch.mutateAsync({ id: formState.branch.id, payload: values })
      : createBranch.mutateAsync(values);

    action.then(() => setFormState({ open: false, branch: null }));
  };

  const handleConfirmDelete = () => {
    deleteBranch.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Branches represent physical or operational business locations.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, branch: null })}>
            <Plus className="size-4" />
            New branch
          </AppButton>
        </Can>
      </div>

      <BranchTable
        branches={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(branch) => setFormState({ open: true, branch })}
        onDelete={setDeleteTarget}
      />

      <BranchFormModal
        open={formState.open}
        initialValues={formState.branch}
        onClose={() => setFormState({ open: false, branch: null })}
        onSubmit={handleSubmit}
        isSubmitting={createBranch.isPending || updateBranch.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete branch"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteBranch.isPending} onClick={handleConfirmDelete}>
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
