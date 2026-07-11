import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useReturnsQuery } from '@/features/returns/queries/useReturnsQuery';
import { useCreateReturn } from '@/features/returns/mutations/useCreateReturn';
import { useUpdateReturn } from '@/features/returns/mutations/useUpdateReturn';
import { useDeleteReturn } from '@/features/returns/mutations/useDeleteReturn';
import { ReturnTable } from '@/features/returns/components/ReturnTable';
import { ReturnFormModal } from '@/features/returns/components/ReturnFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ReturnsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, returnItem: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize }),
    [debouncedSearch, page, pageSize],
  );

  const { data, isLoading } = useReturnsQuery(filters);
  const createReturn = useCreateReturn();
  const updateReturn = useUpdateReturn();
  const deleteReturn = useDeleteReturn();

  const handleSubmit = (values) => {
    const action = formState.returnItem
      ? updateReturn.mutateAsync({ id: formState.returnItem.id, payload: values })
      : createReturn.mutateAsync(values);

    action.then(() => setFormState({ open: false, returnItem: null }));
  };

  const handleConfirmDelete = () => {
    deleteReturn.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Returns</h1>
          <p className="text-sm text-text-muted">Customer and courier returns, warehouse verification and cost impact.</p>
        </div>
        <Can module={MODULES.RETURNS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, returnItem: null })}>
            <Plus className="size-4" />
            New return
          </AppButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search returns…" className="w-72" />
      </FilterBar>

      <ReturnTable
        returns={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(returnItem) => setFormState({ open: true, returnItem })}
        onDelete={setDeleteTarget}
      />

      <ReturnFormModal
        open={formState.open}
        initialValues={formState.returnItem}
        onClose={() => setFormState({ open: false, returnItem: null })}
        onSubmit={handleSubmit}
        isSubmitting={createReturn.isPending || updateReturn.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete return"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteReturn.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.returnNumber}</span>
          ? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
