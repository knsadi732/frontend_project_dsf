import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useCreateDepartment } from '@/features/departments/mutations/useCreateDepartment';
import { useUpdateDepartment } from '@/features/departments/mutations/useUpdateDepartment';
import { useDeleteDepartment } from '@/features/departments/mutations/useDeleteDepartment';
import { DepartmentTable } from '@/features/departments/components/DepartmentTable';
import { DepartmentFormModal } from '@/features/departments/components/DepartmentFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function DepartmentsPanel() {
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, department: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useDepartmentsQuery({ page, pageSize: DEFAULT_PAGE_SIZE });
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const handleSubmit = (values) => {
    const action = formState.department
      ? updateDepartment.mutateAsync({ id: formState.department.id, payload: values })
      : createDepartment.mutateAsync(values);

    action.then(() => setFormState({ open: false, department: null }));
  };

  const handleConfirmDelete = () => {
    deleteDepartment.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Departments group users for reporting and org structure.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, department: null })}>
            <Plus className="size-4" />
            New department
          </AppButton>
        </Can>
      </div>

      <DepartmentTable
        departments={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={(department) => setFormState({ open: true, department })}
        onDelete={setDeleteTarget}
      />

      <DepartmentFormModal
        open={formState.open}
        initialValues={formState.department}
        onClose={() => setFormState({ open: false, department: null })}
        onSubmit={handleSubmit}
        isSubmitting={createDepartment.isPending || updateDepartment.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete department"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteDepartment.isPending} onClick={handleConfirmDelete}>
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
