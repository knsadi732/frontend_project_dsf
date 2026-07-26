import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCategoriesQuery } from '@/features/categories/queries/useCategoriesQuery';
import { useCreateCategory } from '@/features/categories/mutations/useCreateCategory';
import { useUpdateCategory } from '@/features/categories/mutations/useUpdateCategory';
import { useDeleteCategory } from '@/features/categories/mutations/useDeleteCategory';
import { CategoryTable } from '@/features/categories/components/CategoryTable';
import { CategoryFormModal } from '@/features/categories/components/CategoryFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Categories organize products in a parent-child hierarchy.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
            <AppButton onClick={() => setFormState({ open: true, category: null })}>
              <Plus className="size-4" />
              New category
            </AppButton>
          </Can>
        </div>
      </div>

      <CategoryTable
        categories={categories}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(category) => setFormState({ open: true, category })}
        onDelete={setDeleteTarget}
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
