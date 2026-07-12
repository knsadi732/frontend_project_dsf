import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAttendanceQuery } from '@/features/attendance/queries/useAttendanceQuery';
import { useCreateAttendance } from '@/features/attendance/mutations/useCreateAttendance';
import { useUpdateAttendance } from '@/features/attendance/mutations/useUpdateAttendance';
import { useDeleteAttendance } from '@/features/attendance/mutations/useDeleteAttendance';
import { AttendanceTable } from '@/features/attendance/components/AttendanceTable';
import { AttendanceFormModal } from '@/features/attendance/components/AttendanceFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function AttendancePanel({ employeesById, employeeOptions }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, record: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useAttendanceQuery({ page, pageSize });
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();

  const handleSubmit = (values) => {
    const action = formState.record
      ? updateAttendance.mutateAsync({ id: formState.record.id, payload: values })
      : createAttendance.mutateAsync(values);

    action.then(() => setFormState({ open: false, record: null }));
  };

  const handleConfirmDelete = () => {
    deleteAttendance.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Daily check-in/check-out records per employee.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, record: null })}>
            <Plus className="size-4" />
            New record
          </AppButton>
        </Can>
      </div>

      <AttendanceTable
        records={data?.data ?? []}
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
        onEdit={(record) => setFormState({ open: true, record })}
        onDelete={setDeleteTarget}
      />

      <AttendanceFormModal
        open={formState.open}
        initialValues={formState.record}
        employeeOptions={employeeOptions}
        onClose={() => setFormState({ open: false, record: null })}
        onSubmit={handleSubmit}
        isSubmitting={createAttendance.isPending || updateAttendance.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete attendance record"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteAttendance.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete this attendance record? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
