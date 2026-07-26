import { useState } from 'react';
import { useDesignationsQuery } from '@/features/designations/queries/useDesignationsQuery';
import { useCreateDesignation } from '@/features/designations/mutations/useCreateDesignation';
import { useUpdateDesignation } from '@/features/designations/mutations/useUpdateDesignation';
import { useDeleteDesignation } from '@/features/designations/mutations/useDeleteDesignation';
import { DesignationFormModal } from '@/features/designations/components/DesignationFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function DesignationsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, designation: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useDesignationsQuery({ page, pageSize });
  const createDesignation = useCreateDesignation();
  const updateDesignation = useUpdateDesignation();
  const deleteDesignation = useDeleteDesignation();

  const handleSubmit = (values) => {
    const action = formState.designation
      ? updateDesignation.mutateAsync({ id: formState.designation.id, payload: values })
      : createDesignation.mutateAsync(values);

    action.then(() => setFormState({ open: false, designation: null }));
  };

  const handleConfirmDelete = () => {
    deleteDesignation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'title', header: 'Designation', render: (row) => <span className="font-medium text-text">{row.title}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.title}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, designation: row }); }} />
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.title}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Designations are company-wide job titles.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, designation: null })}>New designation</CreateButton>
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
        onRowClick={(designation) => setFormState({ open: true, designation })}
        emptyMessage="No designations yet"
      />

      <DesignationFormModal
        open={formState.open}
        initialValues={formState.designation}
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
