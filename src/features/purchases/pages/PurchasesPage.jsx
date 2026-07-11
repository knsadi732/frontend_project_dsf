import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useCreatePurchase } from '@/features/purchases/mutations/useCreatePurchase';
import { useUpdatePurchase } from '@/features/purchases/mutations/useUpdatePurchase';
import { useDeletePurchase } from '@/features/purchases/mutations/useDeletePurchase';
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable';
import { PurchaseFormModal } from '@/features/purchases/components/PurchaseFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { ORDER_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_OPTIONS = toStatusOptions(ORDER_STATUS);

export function PurchasesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, purchase: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [debouncedSearch, status, appliedDateFrom, appliedDateTo, page],
  );

  const { data, isLoading, isFetching, refetch } = usePurchasesQuery(filters);
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const deletePurchase = useDeletePurchase();

  const handleSubmit = (values) => {
    const action = formState.purchase
      ? updatePurchase.mutateAsync({ id: formState.purchase.id, payload: values })
      : createPurchase.mutateAsync(values);

    action.then(() => setFormState({ open: false, purchase: null }));
  };

  const handleConfirmDelete = () => {
    deletePurchase.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Purchase Orders</h1>
          <p className="text-sm text-text-muted">Manage your purchase orders.</p>
        </div>
        <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, purchase: null })}>
            <Plus className="size-4" />
            New purchase order
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
          placeholder="Search purchase orders…"
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
        <AppInput
          type="date"
          value={dateFrom}
          onChange={(event) => {
            setDateFrom(event.target.value);
            setPage(1);
          }}
          className="w-36"
          aria-label="Order date from"
        />
        <AppInput
          type="date"
          value={dateTo}
          onChange={(event) => {
            setDateTo(event.target.value);
            setPage(1);
          }}
          className="w-36"
          aria-label="Order date to"
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

      <PurchaseTable
        purchases={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={(purchase) => setFormState({ open: true, purchase })}
        onDelete={setDeleteTarget}
      />

      <PurchaseFormModal
        open={formState.open}
        initialValues={formState.purchase}
        onClose={() => setFormState({ open: false, purchase: null })}
        onSubmit={handleSubmit}
        isSubmitting={createPurchase.isPending || updatePurchase.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete purchase order"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deletePurchase.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete{' '}
          <span className="font-medium text-text">{deleteTarget?.poNumber}</span>? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
