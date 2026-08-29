import { useState } from 'react';
import { useItemsQuery } from '@/features/itemMaster/queries/useItemsQuery';
import { useItemVariantsQuery } from '@/features/itemMaster/queries/useItemVariantsQuery';
import { useCreateItemVariant } from '@/features/itemMaster/mutations/useCreateItemVariant';
import { useUpdateItemVariant } from '@/features/itemMaster/mutations/useUpdateItemVariant';
import { ItemVariantFormModal } from '@/features/itemMaster/components/ItemVariantFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppSelect } from '@/components/ui/AppSelect';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

// Item Variant (Chapter 8 — Item -> Variant -> SKU) — lets one Item Master
// row (e.g. "Shole") carry multiple size/color SKUs, mirroring how Product
// Variants work for sellable Products. Every item gets one variant
// auto-created on creation (item.service.js#createItem); this panel is for
// adding the rest (extra sizes/colors) and editing existing ones.
export function ItemVariantsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [itemId, setItemId] = useState('');
  const [formState, setFormState] = useState({ open: false, variant: null });

  const { data: itemsData } = useItemsQuery({ pageSize: 500 });
  const items = itemsData?.data ?? [];
  const itemOptions = items.map((item) => ({ value: item.id, label: `${item.itemCode} — ${item.itemName}` }));

  const { data, isLoading, isFetching, refetch } = useItemVariantsQuery({
    page,
    pageSize,
    itemId: itemId || undefined,
  });
  const createVariant = useCreateItemVariant();
  const updateVariant = useUpdateItemVariant();

  const handleSubmit = (values) => {
    const action = formState.variant
      ? updateVariant.mutateAsync({ id: formState.variant.id, payload: values })
      : createVariant.mutateAsync(values);
    action.then(() => setFormState({ open: false, variant: null }));
  };

  const columns = [
    { key: 'sku', header: 'SKU', render: (row) => <span className="font-medium text-text">{row.sku}</span> },
    { key: 'itemName', header: 'Item', render: (row) => `${row.itemCode} — ${row.itemName}` },
    { key: 'size', header: 'Size', render: (row) => row.size || '—' },
    { key: 'color', header: 'Color', render: (row) => row.color || '—' },
    {
      key: 'standardCost',
      header: 'Standard cost',
      render: (row) => (row.standardCost != null ? `₹${row.standardCost.toLocaleString('en-IN')}` : '—'),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.sku}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, variant: row }); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Size/color SKUs for each Item — e.g. one item can have multiple sizes, each with its own stock and cost.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, variant: null })}>New variant</CreateButton>
          </Can>
        </div>
      </div>

      <FilterBar>
        <AppSelect
          value={itemId}
          onChange={(event) => { setItemId(event.target.value); setPage(1); }}
          options={itemOptions}
          placeholder="All items"
          className="w-72"
          aria-label="Filter by item"
        />
      </FilterBar>

      <AppTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onRowClick={(variant) => setFormState({ open: true, variant })}
        emptyMessage="No item variants yet"
      />

      <ItemVariantFormModal
        open={formState.open}
        initialValues={formState.variant}
        itemOptions={itemOptions}
        onClose={() => setFormState({ open: false, variant: null })}
        onSubmit={handleSubmit}
        isSubmitting={createVariant.isPending || updateVariant.isPending}
      />
    </div>
  );
}
