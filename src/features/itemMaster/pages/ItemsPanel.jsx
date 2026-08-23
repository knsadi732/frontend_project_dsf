import { useState } from 'react';
import { useItemCategoriesQuery } from '@/features/itemMaster/queries/useItemCategoriesQuery';
import { useItemsQuery } from '@/features/itemMaster/queries/useItemsQuery';
import { useCreateItem } from '@/features/itemMaster/mutations/useCreateItem';
import { useUpdateItem } from '@/features/itemMaster/mutations/useUpdateItem';
import { ItemFormModal } from '@/features/itemMaster/components/ItemFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppSelect } from '@/components/ui/AppSelect';
import { SearchInput } from '@/components/ui/SearchInput';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ItemsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [formState, setFormState] = useState({ open: false, item: null });

  const debouncedSearch = useDebounce(search);

  const { data: categoriesData } = useItemCategoriesQuery({ pageSize: 200 });
  const categoryOptions = (categoriesData?.data ?? []).map((c) => ({ value: c.id, label: c.categoryName }));

  const { data, isLoading, isFetching, refetch } = useItemsQuery({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    itemCategoryId: itemCategoryId || undefined,
  });
  const items = data?.data ?? [];
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();

  const handleSubmit = (values) => {
    const action = formState.item
      ? updateItem.mutateAsync({ id: formState.item.id, payload: values })
      : createItem.mutateAsync(values);
    action.then(() => setFormState({ open: false, item: null }));
  };

  const columns = [
    { key: 'itemCode', header: 'Code' },
    { key: 'itemName', header: 'Item', render: (row) => <span className="font-medium text-text">{row.itemName}</span> },
    { key: 'itemCategoryName', header: 'Category', render: (row) => row.itemCategoryName ?? '—' },
    { key: 'uom', header: 'UOM', render: (row) => row.uom || '—' },
    { key: 'preferredVendorName', header: 'Preferred vendor', render: (row) => row.preferredVendorName ?? '—' },
    { key: 'standardCost', header: 'Standard cost', render: (row) => (row.standardCost != null ? `₹${Number(row.standardCost).toLocaleString('en-IN')}` : '—') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.itemName}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, item: row }); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Raw material, packaging, consumables, spares, tools, fixed assets and services — everything the company buys or consumes that isn&apos;t a sellable product.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, item: null })}>New item</CreateButton>
          </Can>
        </div>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search items…" className="w-72" />
        <AppSelect
          value={itemCategoryId}
          onChange={(event) => { setItemCategoryId(event.target.value); setPage(1); }}
          options={categoryOptions}
          placeholder="All categories"
          className="w-56"
          aria-label="Filter by category"
        />
      </FilterBar>

      <AppTable
        columns={columns}
        data={items}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onRowClick={(item) => setFormState({ open: true, item })}
        emptyMessage="No items yet"
      />

      <ItemFormModal
        open={formState.open}
        initialValues={formState.item}
        categoryOptions={categoryOptions}
        onClose={() => setFormState({ open: false, item: null })}
        onSubmit={handleSubmit}
        isSubmitting={createItem.isPending || updateItem.isPending}
      />
    </div>
  );
}
