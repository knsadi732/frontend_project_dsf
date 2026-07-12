import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLeavesQuery } from '@/features/leaves/queries/useLeavesQuery';
import { useCreateLeave } from '@/features/leaves/mutations/useCreateLeave';
import { useUpdateLeave } from '@/features/leaves/mutations/useUpdateLeave';
import { useDeleteLeave } from '@/features/leaves/mutations/useDeleteLeave';
import { LeaveTable } from '@/features/leaves/components/LeaveTable';
import { LeaveFormModal } from '@/features/leaves/components/LeaveFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function LeavesPanel({ employeesById, employeeOptions }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, leave: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useLeavesQuery({ page, pageSize });
  const createLeave = useCreateLeave();
  const updateLeave = useUpdateLeave();
  const deleteLeave = useDeleteLeave();

  const handleSubmit = (values) => {
    const action = formState.leave
      ? updateLeave.mutateAsync({ id: formState.leave.id, payload: values })
      : createLeave.mutateAsync(values);

    action.then(() => setFormState({ open: false, leave: null }));
  };

  const handleConfirmDelete = () => {
    deleteLeave.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Leave requests and approvals.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, leave: null })}>
            <Plus className="size-4" />
            New leave request
          </AppButton>
        </Can>
      </div>

      <LeaveTable
        leaves={data?.data ?? []}
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
        onEdit={(leave) => setFormState({ open: true, leave })}
        onDelete={setDeleteTarget}
        onApprove={(leave) => updateLeave.mutate({ id: leave.id, payload: { status: 'approved' } })}
        onReject={(leave) => updateLeave.mutate({ id: leave.id, payload: { status: 'rejected' } })}
      />

      <LeaveFormModal
        open={formState.open}
        initialValues={formState.leave}
        employeeOptions={employeeOptions}
        onClose={() => setFormState({ open: false, leave: null })}
        onSubmit={handleSubmit}
        isSubmitting={createLeave.isPending || updateLeave.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete leave request"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteLeave.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete this leave request? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
