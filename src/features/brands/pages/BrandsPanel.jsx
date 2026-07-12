import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBrandsQuery } from '@/features/brands/queries/useBrandsQuery';
import { useCreateBrand } from '@/features/brands/mutations/useCreateBrand';
import { useUpdateBrand } from '@/features/brands/mutations/useUpdateBrand';
import { useDeleteBrand } from '@/features/brands/mutations/useDeleteBrand';
import { BrandTable } from '@/features/brands/components/BrandTable';
import { BrandFormModal } from '@/features/brands/components/BrandFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function BrandsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, brand: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useBrandsQuery({ page, pageSize });
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const handleSubmit = (values) => {
    const action = formState.brand
      ? updateBrand.mutateAsync({ id: formState.brand.id, payload: values })
      : createBrand.mutateAsync(values);

    action.then(() => setFormState({ open: false, brand: null }));
  };

  const handleConfirmDelete = () => {
    deleteBrand.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Every product belongs to one brand.</p>
        <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, brand: null })}>
            <Plus className="size-4" />
            New brand
          </AppButton>
        </Can>
      </div>

      <BrandTable
        brands={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(brand) => setFormState({ open: true, brand })}
        onDelete={setDeleteTarget}
      />

      <BrandFormModal
        open={formState.open}
        initialValues={formState.brand}
        onClose={() => setFormState({ open: false, brand: null })}
        onSubmit={handleSubmit}
        isSubmitting={createBrand.isPending || updateBrand.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete brand"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteBrand.isPending} onClick={handleConfirmDelete}>
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
