import { useState } from 'react';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useCreateBranch } from '@/features/branches/mutations/useCreateBranch';
import { useUpdateBranch } from '@/features/branches/mutations/useUpdateBranch';
import { useDeleteBranch } from '@/features/branches/mutations/useDeleteBranch';
import { BranchFormModal } from '@/features/branches/components/BranchFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
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

  const columns = [
    { key: 'name', header: 'Branch', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, branch: row }); }} />
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
        <p className="text-sm text-text-muted">Branches represent physical or operational business locations.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, branch: null })}>New branch</CreateButton>
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
        onRowClick={(branch) => setFormState({ open: true, branch })}
        emptyMessage="No branches yet"
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
