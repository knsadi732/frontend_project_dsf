import { useState } from 'react';
import { useLeavesQuery } from '@/features/leaves/queries/useLeavesQuery';
import { useCreateLeave } from '@/features/leaves/mutations/useCreateLeave';
import { useUpdateLeave } from '@/features/leaves/mutations/useUpdateLeave';
import { useDeleteLeave } from '@/features/leaves/mutations/useDeleteLeave';
import { LeaveFormModal } from '@/features/leaves/components/LeaveFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApproveButton, RejectButton, EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { getEmployeeFullName } from '@/utils/employeeName';

const LEAVE_STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' };

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

  const columns = [
    { key: 'employee', header: 'Employee', render: (row) => employeesById?.[row.employeeId] ? getEmployeeFullName(employeesById[row.employeeId]) : row.employeeId },
    { key: 'leaveType', header: 'Type', render: (row) => <span className="capitalize">{row.leaveType?.replace(/_/g, ' ')}</span> },
    { key: 'fromDate', header: 'From' },
    { key: 'toDate', header: 'To' },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={LEAVE_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'pending' && (
            <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
              <ApproveButton label="Approve leave" onClick={(e) => { e.stopPropagation(); updateLeave.mutate({ id: row.id, payload: { status: 'approved' } }); }} />
              <RejectButton label="Reject leave" onClick={(e) => { e.stopPropagation(); updateLeave.mutate({ id: row.id, payload: { status: 'rejected' } }); }} />
            </Can>
          )}
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label="Edit leave" onClick={(e) => { e.stopPropagation(); setFormState({ open: true, leave: row }); }} />
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete leave" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Leave requests and approvals.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, leave: null })}>New leave request</CreateButton>
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
        onRowClick={(leave) => setFormState({ open: true, leave })}
        emptyMessage="No leave requests yet"
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
