import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useDesignationsQuery } from '@/features/designations/queries/useDesignationsQuery';
import { useCreateDesignation } from '@/features/designations/mutations/useCreateDesignation';
import { useUpdateDesignation } from '@/features/designations/mutations/useUpdateDesignation';
import { useDeleteDesignation } from '@/features/designations/mutations/useDeleteDesignation';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { DesignationTable } from '@/features/designations/components/DesignationTable';
import { DesignationFormModal } from '@/features/designations/components/DesignationFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function DesignationsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, designation: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useDesignationsQuery({ page, pageSize });
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const createDesignation = useCreateDesignation();
  const updateDesignation = useUpdateDesignation();
  const deleteDesignation = useDeleteDesignation();

  const departments = useMemo(() => departmentsData?.data ?? [], [departmentsData]);
  const departmentsById = useMemo(
    () => Object.fromEntries(departments.map((department) => [department.id, department])),
    [departments],
  );
  const departmentOptions = departments.map((department) => ({ value: department.id, label: department.name }));

  const handleSubmit = (values) => {
    const action = formState.designation
      ? updateDesignation.mutateAsync({ id: formState.designation.id, payload: values })
      : createDesignation.mutateAsync(values);

    action.then(() => setFormState({ open: false, designation: null }));
  };

  const handleConfirmDelete = () => {
    deleteDesignation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Designations are job titles, each tied to a department.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, designation: null })}>
            <Plus className="size-4" />
            New designation
          </AppButton>
        </Can>
      </div>

      <DesignationTable
        designations={data?.data ?? []}
        departmentsById={departmentsById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(designation) => setFormState({ open: true, designation })}
        onDelete={setDeleteTarget}
      />

      <DesignationFormModal
        open={formState.open}
        initialValues={formState.designation}
        departmentOptions={departmentOptions}
        onClose={() => setFormState({ open: false, designation: null })}
        onSubmit={handleSubmit}
        isSubmitting={createDesignation.isPending || updateDesignation.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete designation"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteDesignation.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.title}</span>? This
          action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
