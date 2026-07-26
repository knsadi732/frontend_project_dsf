import { useState } from 'react';
import { useCategoriesQuery } from '@/features/categories/queries/useCategoriesQuery';
import { useCreateCategory } from '@/features/categories/mutations/useCreateCategory';
import { useUpdateCategory } from '@/features/categories/mutations/useUpdateCategory';
import { useDeleteCategory } from '@/features/categories/mutations/useDeleteCategory';
import { CategoryFormModal } from '@/features/categories/components/CategoryFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function CategoriesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, refetch } = useCategoriesQuery({ page, pageSize });
  const categories = data?.data ?? [];
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const parentOptions = categories
    .filter((category) => category.id !== formState.category?.id)
    .map((category) => ({ value: category.id, label: category.name }));

  const handleSubmit = (values) => {
    const action = formState.category
      ? updateCategory.mutateAsync({ id: formState.category.id, payload: values })
      : createCategory.mutateAsync(values);

    action.then(() => setFormState({ open: false, category: null }));
  };

  const handleConfirmDelete = () => {
    deleteCategory.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'name', header: 'Category', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'categoryCode', header: 'Code' },
    { key: 'parent', header: 'Parent', render: (row) => row.parent_name ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, category: row }); }} />
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.name}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Categories organize products in a parent-child hierarchy.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, category: null })}>New category</CreateButton>
          </Can>
        </div>
      </div>

      <AppTable
        columns={columns}
        data={categories}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRowClick={(category) => setFormState({ open: true, category })}
        emptyMessage="No categories yet"
      />

      <CategoryFormModal
        open={formState.open}
        initialValues={formState.category}
        parentOptions={parentOptions}
        onClose={() => setFormState({ open: false, category: null })}
        onSubmit={handleSubmit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete category"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteCategory.isPending} onClick={handleConfirmDelete}>
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
