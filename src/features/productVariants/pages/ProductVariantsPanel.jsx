import { useState } from 'react';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useCreateProductVariant } from '@/features/productVariants/mutations/useCreateProductVariant';
import { useUpdateProductVariant } from '@/features/productVariants/mutations/useUpdateProductVariant';
import { useDeleteProductVariant } from '@/features/productVariants/mutations/useDeleteProductVariant';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { ProductVariantFormModal } from '@/features/productVariants/components/ProductVariantFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
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

  const columns = [
    { key: 'product', header: 'Product', render: (row) => productsById?.[row.productId]?.name ?? row.productId },
    { key: 'size', header: 'Size' },
    { key: 'color', header: 'Color' },
    { key: 'sku', header: 'SKU' },
    { key: 'barcode', header: 'Barcode' },
    { key: 'mrp', header: 'MRP', render: (row) => `₹${Number(row.mrp).toLocaleString('en-IN')}` },
    { key: 'sellingPrice', header: 'Selling Price', render: (row) => `₹${Number(row.sellingPrice).toLocaleString('en-IN')}` },
    { key: 'costPrice', header: 'Cost Price', render: (row) => `₹${Number(row.costPrice).toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.sku}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, variant: row }); }} />
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.sku}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Variants capture size/color/SKU/barcode/pricing per product.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, variant: null })}>New variant</CreateButton>
          </Can>
        </div>
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
        onRowClick={(variant) => setFormState({ open: true, variant })}
        emptyMessage="No product variants yet"
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
