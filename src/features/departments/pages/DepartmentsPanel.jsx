import { useState } from 'react';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useCreateDepartment } from '@/features/departments/mutations/useCreateDepartment';
import { useUpdateDepartment } from '@/features/departments/mutations/useUpdateDepartment';
import { useDeleteDepartment } from '@/features/departments/mutations/useDeleteDepartment';
import { DepartmentFormModal } from '@/features/departments/components/DepartmentFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function DepartmentsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, department: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useDepartmentsQuery({ page, pageSize });
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

  const columns = [
    { key: 'name', header: 'Department', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, department: row }); }} />
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
        <p className="text-sm text-text-muted">Departments group users for reporting and org structure.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, department: null })}>New department</CreateButton>
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
        onRowClick={(department) => setFormState({ open: true, department })}
        emptyMessage="No departments yet"
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
