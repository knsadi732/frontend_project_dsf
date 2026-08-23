import { useState } from 'react';
import { useItemCategoriesQuery } from '@/features/itemMaster/queries/useItemCategoriesQuery';
import { useCreateItemCategory } from '@/features/itemMaster/mutations/useCreateItemCategory';
import { useUpdateItemCategory } from '@/features/itemMaster/mutations/useUpdateItemCategory';
import { ItemCategoryFormModal } from '@/features/itemMaster/components/ItemCategoryFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STOCK_KIND_LABEL = {
  raw_material: 'Raw Material',
  packaging_material: 'Packaging Material',
  consumable: 'Consumable',
  spare_part: 'Spare Part',
  fixed_asset: 'Fixed Asset',
  tool: 'Tool',
  service: 'Service',
};

export function ItemCategoriesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, category: null });

  const { data, isLoading, isFetching, refetch } = useItemCategoriesQuery({ page, pageSize });
  const categories = data?.data ?? [];
  const createCategory = useCreateItemCategory();
  const updateCategory = useUpdateItemCategory();

  const parentOptions = categories
    .filter((category) => category.id !== formState.category?.id)
    .map((category) => ({ value: category.id, label: category.categoryName }));

  const handleSubmit = (values) => {
    const action = formState.category
      ? updateCategory.mutateAsync({ id: formState.category.id, payload: values })
      : createCategory.mutateAsync(values);
    action.then(() => setFormState({ open: false, category: null }));
  };

  const columns = [
    { key: 'categoryName', header: 'Category', render: (row) => <span className="font-medium text-text">{row.categoryName}</span> },
    { key: 'categoryCode', header: 'Code' },
    { key: 'parentCategoryName', header: 'Parent', render: (row) => row.parentCategoryName ?? '—' },
    { key: 'stockKind', header: 'Stock kind', render: (row) => (row.stockKind ? STOCK_KIND_LABEL[row.stockKind] ?? row.stockKind : '—') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.categoryName}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, category: row }); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Categories for everything the company buys or consumes that isn&apos;t a sellable product — raw material, packaging, consumables, spares, tools, fixed assets, and services.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, category: null })}>New category</CreateButton>
          </Can>
        </div>
      </div>

      <AppTable
        columns={columns}
        data={categories}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onRowClick={(category) => setFormState({ open: true, category })}
        emptyMessage="No item categories yet"
      />

      <ItemCategoryFormModal
        open={formState.open}
        initialValues={formState.category}
        parentOptions={parentOptions}
        onClose={() => setFormState({ open: false, category: null })}
        onSubmit={handleSubmit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />
    </div>
  );
}
