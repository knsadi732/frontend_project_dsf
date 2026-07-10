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
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ProductionPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, workOrder: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize: DEFAULT_PAGE_SIZE }),
    [debouncedSearch, page],
  );

  const { data, isLoading } = useWorkOrdersQuery(filters);
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
    <div className="flex flex-col gap-4">
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
        <SearchInput value={search} onChange={setSearch} placeholder="Search work orders…" className="w-72" />
      </FilterBar>

      <WorkOrderTable
        workOrders={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
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
