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
import { AppSelect } from '@/components/ui/AppSelect';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { RECORD_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_OPTIONS = toStatusOptions(RECORD_STATUS);

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, product: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, status, page, pageSize }),
    [debouncedSearch, status, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useProductsQuery(filters);
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
    <div className="flex flex-col gap-3">
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
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="w-72"
        />
        <AppSelect
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          className="w-40"
          aria-label="Filter by status"
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

      <ProductTable
        products={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
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
