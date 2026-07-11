import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useInventoryListQuery } from '@/features/inventory/queries/useInventoryListQuery';
import { useCreateInventoryItem } from '@/features/inventory/mutations/useCreateInventoryItem';
import { useUpdateInventoryItem } from '@/features/inventory/mutations/useUpdateInventoryItem';
import { useDeleteInventoryItem } from '@/features/inventory/mutations/useDeleteInventoryItem';
import { InventoryTable } from '@/features/inventory/components/InventoryTable';
import { InventoryFormModal } from '@/features/inventory/components/InventoryFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize }),
    [debouncedSearch, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useInventoryListQuery(filters);
  const createInventoryItem = useCreateInventoryItem();
  const updateInventoryItem = useUpdateInventoryItem();
  const deleteInventoryItem = useDeleteInventoryItem();

  const handleSubmit = (values) => {
    const action = formState.item
      ? updateInventoryItem.mutateAsync({ id: formState.item.id, payload: values })
      : createInventoryItem.mutateAsync(values);

    action.then(() => setFormState({ open: false, item: null }));
  };

  const handleConfirmDelete = () => {
    deleteInventoryItem.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Inventory</h1>
          <p className="text-sm text-text-muted">Manage your stock ledger.</p>
        </div>
        <Can module={MODULES.INVENTORY} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, item: null })}>
            <Plus className="size-4" />
            New inventory item
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
          placeholder="Search inventory…"
          className="w-72"
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

      <InventoryTable
        items={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(item) => setFormState({ open: true, item })}
        onDelete={setDeleteTarget}
      />

      <InventoryFormModal
        open={formState.open}
        initialValues={formState.item}
        onClose={() => setFormState({ open: false, item: null })}
        onSubmit={handleSubmit}
        isSubmitting={createInventoryItem.isPending || updateInventoryItem.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete inventory item"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteInventoryItem.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete{' '}
          <span className="font-medium text-text">{deleteTarget?.productName}</span>? This action cannot be
          undone.
        </p>
      </AppModal>
    </div>
  );
}
