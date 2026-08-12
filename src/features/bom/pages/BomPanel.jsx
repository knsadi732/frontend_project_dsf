import { useMemo, useState } from 'react';
import { useBomLinesQuery } from '@/features/bom/queries/useBomLinesQuery';
import { useCreateBomLine } from '@/features/bom/mutations/useCreateBomLine';
import { useUpdateBomLine } from '@/features/bom/mutations/useUpdateBomLine';
import { useDeleteBomLine } from '@/features/bom/mutations/useDeleteBomLine';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { BomLineFormModal } from '@/features/bom/components/BomLineFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

// Master data: "1 unit of Product X needs Y of raw material Z" — feeds the
// Material Issue Request auto-raised the moment a Work Order is created for
// that product (see Production → Material Requests). No BOM lines = no MIR
// gets raised at all, so this has to be set up before that flow does anything.
export function BomPanel() {
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, bomLine: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, productId: productFilter, page, pageSize }),
    [debouncedSearch, productFilter, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useBomLinesQuery(filters);
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productOptions = (productsData?.data ?? [])
    .filter((product) => product.productionRequired)
    .map((product) => ({ value: product.id, label: product.name }));

  const createBomLine = useCreateBomLine();
  const updateBomLine = useUpdateBomLine();
  const deleteBomLine = useDeleteBomLine();

  const handleSubmit = (values) => {
    const action = formState.bomLine?.id
      ? updateBomLine.mutateAsync({ id: formState.bomLine.id, payload: values })
      : createBomLine.mutateAsync(values);

    action.then(() => setFormState({ open: false, bomLine: null }));
  };

  const handleConfirmDelete = () => {
    deleteBomLine.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'productName', header: 'Finished Product' },
    {
      key: 'rawMaterial',
      header: 'Raw Material',
      render: (row) => [row.sku, row.rawMaterialName, row.size, row.color].filter(Boolean).join(' — '),
    },
    { key: 'quantityPerUnit', header: 'Qty per unit' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            <EditButton label="Edit BOM line" onClick={(event) => { event.stopPropagation(); setFormState({ open: true, bomLine: row }); }} />
          </Can>
          <Can module={MODULES.PRODUCTION} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete BOM line" onClick={(event) => { event.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Define how much raw material goes into one unit of each manufactured product.
        </p>
        <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, bomLine: null })}>New BOM line</CreateButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search BOM lines…"
          className="w-72"
        />
        <AppSelect
          placeholder="All products"
          className="w-56"
          options={productOptions}
          value={productFilter}
          onChange={(event) => {
            setProductFilter(event.target.value);
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
        onRowClick={(bomLine) => setFormState({ open: true, bomLine })}
        emptyMessage="No BOM lines yet"
      />

      <BomLineFormModal
        open={formState.open}
        initialValues={formState.bomLine}
        onClose={() => setFormState({ open: false, bomLine: null })}
        onSubmit={handleSubmit}
        isSubmitting={createBomLine.isPending || updateBomLine.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete BOM line"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteBomLine.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete this BOM line ({deleteTarget?.productName} —{' '}
          {[deleteTarget?.sku, deleteTarget?.rawMaterialName].filter(Boolean).join(' ')})? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
