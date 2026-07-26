import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useCreateProductVariant } from '@/features/productVariants/mutations/useCreateProductVariant';
import { useUpdateProductVariant } from '@/features/productVariants/mutations/useUpdateProductVariant';
import { useDeleteProductVariant } from '@/features/productVariants/mutations/useDeleteProductVariant';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { ProductVariantTable } from '@/features/productVariants/components/ProductVariantTable';
import { ProductVariantFormModal } from '@/features/productVariants/components/ProductVariantFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ProductVariantsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, variant: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, refetch } = useProductVariantsQuery({ page, pageSize });
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const products = productsData?.data ?? [];
  const productsById = Object.fromEntries(products.map((product) => [product.id, product]));
  const productOptions = products.map((product) => ({ value: product.id, label: product.name }));

  const createVariant = useCreateProductVariant();
  const updateVariant = useUpdateProductVariant();
  const deleteVariant = useDeleteProductVariant();

  const handleSubmit = (values) => {
    const action = formState.variant
      ? updateVariant.mutateAsync({ id: formState.variant.id, payload: values })
      : createVariant.mutateAsync(values);

    action.then(() => setFormState({ open: false, variant: null }));
  };

  const handleConfirmDelete = () => {
    deleteVariant.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Variants capture size/color/SKU/barcode/pricing per product.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
            <AppButton onClick={() => setFormState({ open: true, variant: null })}>
              <Plus className="size-4" />
              New variant
            </AppButton>
          </Can>
        </div>
      </div>

      <ProductVariantTable
        variants={data?.data ?? []}
        productsById={productsById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(variant) => setFormState({ open: true, variant })}
        onDelete={setDeleteTarget}
      />

      <ProductVariantFormModal
        open={formState.open}
        initialValues={formState.variant}
        productOptions={productOptions}
        onClose={() => setFormState({ open: false, variant: null })}
        onSubmit={handleSubmit}
        isSubmitting={createVariant.isPending || updateVariant.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete product variant"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteVariant.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.sku}</span>? This
          action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
