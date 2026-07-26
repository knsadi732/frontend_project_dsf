import { useMemo, useState } from 'react';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useCreateProduct } from '@/features/products/mutations/useCreateProduct';
import { useUpdateProduct } from '@/features/products/mutations/useUpdateProduct';
import { useDeleteProduct } from '@/features/products/mutations/useDeleteProduct';
import { useCategoriesQuery } from '@/features/categories/queries/useCategoriesQuery';
import { useBrandsQuery } from '@/features/brands/queries/useBrandsQuery';
import { CategoriesPanel } from '@/features/categories';
import { BrandsPanel } from '@/features/brands';
import { ProductVariantsPanel } from '@/features/productVariants';
import { ProductFormModal } from '@/features/products/components/ProductFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { RECORD_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

const STATUS_OPTIONS = toStatusOptions(RECORD_STATUS);

function downloadProductPdf(row, categoriesById, brandsById) {
  generateRecordPdf({
    title: `Product - ${row.name}`,
    fields: [
      { label: 'Product code', value: row.productCode },
      { label: 'Category', value: categoriesById?.[row.categoryId]?.name },
      { label: 'Brand', value: brandsById?.[row.brandId]?.name },
      { label: 'Gender', value: row.gender },
      { label: 'HSN code', value: row.hsnCode },
      { label: 'GST %', value: row.gstPercentage },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.productCode || row.name}.pdf`,
  });
}

const TABS = [
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'brands', label: 'Brands' },
  { key: 'variants', label: 'Variants' },
];

export function ProductsPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, product: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: categoriesData } = useCategoriesQuery({ pageSize: 100 });
  const categories = categoriesData?.data ?? [];
  const categoriesById = Object.fromEntries(categories.map((category) => [category.id, category]));
  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }));

  const { data: brandsData } = useBrandsQuery({ pageSize: 100 });
  const brands = brandsData?.data ?? [];
  const brandsById = Object.fromEntries(brands.map((brand) => [brand.id, brand]));
  const brandOptions = brands.map((brand) => ({ value: brand.id, label: brand.name }));

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

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'productCode', header: 'Code' },
    { key: 'category', header: 'Category', render: (row) => categoriesById?.[row.categoryId]?.name ?? '—' },
    { key: 'brand', header: 'Brand', render: (row) => brandsById?.[row.brandId]?.name ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton
            label={`Download ${row.name}`}
            onClick={(event) => {
              event.stopPropagation();
              downloadProductPdf(row, categoriesById, brandsById);
            }}
          />
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, product: row }); }} />
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.name}`} onClick={(event) => { event.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Products</h1>
          <p className="text-sm text-text-muted">Manage your product catalog.</p>
        </div>
        {activeTab === 'products' && (
          <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, product: null })}>New product</CreateButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'products' && (
        <>
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
            <MultiFilter
              filters={[{ key: 'status', label: 'Status', options: STATUS_OPTIONS }]}
              values={{ status }}
              onChange={(key, value) => {
                setStatus(value);
                setPage(1);
              }}
              onClear={() => {
                setStatus('');
                setPage(1);
              }}
            />
            <RefreshButton onClick={refetch} isFetching={isFetching} />
          </FilterBar>

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
            onRowClick={(product) => setFormState({ open: true, product })}
            emptyMessage="No products yet"
          />

          <ProductFormModal
            open={formState.open}
            initialValues={formState.product}
            categoryOptions={categoryOptions}
            brandOptions={brandOptions}
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
        </>
      )}

      {activeTab === 'categories' && <CategoriesPanel />}
      {activeTab === 'brands' && <BrandsPanel />}
      {activeTab === 'variants' && <ProductVariantsPanel />}
    </div>
  );
}
