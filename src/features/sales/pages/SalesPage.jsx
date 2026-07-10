import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useCreateSalesOrder } from '@/features/sales/mutations/useCreateSalesOrder';
import { useUpdateSalesOrder } from '@/features/sales/mutations/useUpdateSalesOrder';
import { useDeleteSalesOrder } from '@/features/sales/mutations/useDeleteSalesOrder';
import { SalesOrderTable } from '@/features/sales/components/SalesOrderTable';
import { SalesOrderFormModal } from '@/features/sales/components/SalesOrderFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function SalesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, salesOrder: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize: DEFAULT_PAGE_SIZE }),
    [debouncedSearch, page],
  );

  const { data, isLoading } = useSalesOrdersQuery(filters);
  const createSalesOrder = useCreateSalesOrder();
  const updateSalesOrder = useUpdateSalesOrder();
  const deleteSalesOrder = useDeleteSalesOrder();

  const handleSubmit = (values) => {
    const action = formState.salesOrder
      ? updateSalesOrder.mutateAsync({ id: formState.salesOrder.id, payload: values })
      : createSalesOrder.mutateAsync(values);

    action.then(() => setFormState({ open: false, salesOrder: null }));
  };

  const handleConfirmDelete = () => {
    deleteSalesOrder.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Sales Orders</h1>
          <p className="text-sm text-text-muted">Manage your sales orders.</p>
        </div>
        <Can module={MODULES.SALES} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, salesOrder: null })}>
            <Plus className="size-4" />
            New sales order
          </AppButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search sales orders…" className="w-72" />
      </FilterBar>

      <SalesOrderTable
        salesOrders={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={(salesOrder) => setFormState({ open: true, salesOrder })}
        onDelete={setDeleteTarget}
      />

      <SalesOrderFormModal
        open={formState.open}
        initialValues={formState.salesOrder}
        onClose={() => setFormState({ open: false, salesOrder: null })}
        onSubmit={handleSubmit}
        isSubmitting={createSalesOrder.isPending || updateSalesOrder.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete sales order"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteSalesOrder.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.soNumber}</span>
          ? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
