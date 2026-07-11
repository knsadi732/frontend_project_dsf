import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useWorkOrdersQuery } from '@/features/production/queries/useWorkOrdersQuery';
import { useCreateWorkOrder } from '@/features/production/mutations/useCreateWorkOrder';
import { useUpdateWorkOrder } from '@/features/production/mutations/useUpdateWorkOrder';
import { useDeleteWorkOrder } from '@/features/production/mutations/useDeleteWorkOrder';
import { WorkOrderTable } from '@/features/production/components/WorkOrderTable';
import { WorkOrderFormModal } from '@/features/production/components/WorkOrderFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { WORK_ORDER_STAGE_OPTIONS } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ProductionPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, workOrder: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo,
      page,
      pageSize,
    }),
    [debouncedSearch, status, appliedDateFrom, appliedDateTo, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useWorkOrdersQuery(filters);
  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const deleteWorkOrder = useDeleteWorkOrder();

  const handleSubmit = (values) => {
    const action = formState.workOrder
      ? updateWorkOrder.mutateAsync({ id: formState.workOrder.id, payload: values })
      : createWorkOrder.mutateAsync(values);

    action.then(() => setFormState({ open: false, workOrder: null }));
  };

  const handleConfirmDelete = () => {
    deleteWorkOrder.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Production</h1>
          <p className="text-sm text-text-muted">Manage your work orders.</p>
        </div>
        <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, workOrder: null })}>
            <Plus className="size-4" />
            New work order
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
          placeholder="Search work orders…"
          className="w-72"
        />
        <AppSelect
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={WORK_ORDER_STAGE_OPTIONS}
          placeholder="All stages"
          className="w-40"
          aria-label="Filter by stage"
        />
        <AppInput
          type="date"
          value={dateFrom}
          onChange={(event) => {
            setDateFrom(event.target.value);
            setPage(1);
          }}
          className="w-36"
          aria-label="Due date from"
        />
        <AppInput
          type="date"
          value={dateTo}
          onChange={(event) => {
            setDateTo(event.target.value);
            setPage(1);
          }}
          className="w-36"
          aria-label="Due date to"
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

      <WorkOrderTable
        workOrders={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(workOrder) => setFormState({ open: true, workOrder })}
        onDelete={setDeleteTarget}
      />

      <WorkOrderFormModal
        open={formState.open}
        initialValues={formState.workOrder}
        onClose={() => setFormState({ open: false, workOrder: null })}
        onSubmit={handleSubmit}
        isSubmitting={createWorkOrder.isPending || updateWorkOrder.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete work order"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteWorkOrder.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete{' '}
          <span className="font-medium text-text">{deleteTarget?.workOrderNumber}</span>? This action cannot be
          undone.
        </p>
      </AppModal>
    </div>
  );
}
