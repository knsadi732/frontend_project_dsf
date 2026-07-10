import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useCreateProduct } from '@/features/products/mutations/useCreateProduct';
import { useUpdateProduct } from '@/features/products/mutations/useUpdateProduct';
import { useDeleteProduct } from '@/features/products/mutations/useDeleteProduct';
import { ProductTable } from '@/features/products/components/ProductTable';
import { ProductFormModal } from '@/features/products/components/ProductFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, product: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize: DEFAULT_PAGE_SIZE }),
    [debouncedSearch, page],
  );

  const { data, isLoading } = useProductsQuery(filters);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSubmit = (values) => {
    const action = formState.product
      ? updateProduct.mutateAsync({ id: formState.product.id, payload: values })
      : createProduct.mutateAsync(values);

    action.then(() => setFormState({ open: false, product: null }));
  };

  const handleConfirmDelete = () => {
    deleteProduct.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Products</h1>
          <p className="text-sm text-text-muted">Manage your product catalog.</p>
        </div>
        <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, product: null })}>
            <Plus className="size-4" />
            New product
          </AppButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search products…" className="w-72" />
      </FilterBar>

      <ProductTable
        products={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={(product) => setFormState({ open: true, product })}
        onDelete={setDeleteTarget}
      />

      <ProductFormModal
        open={formState.open}
        initialValues={formState.product}
        onClose={() => setFormState({ open: false, product: null })}
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete product"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteProduct.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.name}</span>
          ? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
