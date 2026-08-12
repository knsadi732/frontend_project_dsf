import { useMemo, useState } from 'react';
import { useReturnsQuery } from '@/features/returns/queries/useReturnsQuery';
import { useCreateReturn } from '@/features/returns/mutations/useCreateReturn';
import { useUpdateReturn } from '@/features/returns/mutations/useUpdateReturn';
import { useDeleteReturn } from '@/features/returns/mutations/useDeleteReturn';
import { ReturnFormModal } from '@/features/returns/components/ReturnFormModal';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { RETURN_REASON_OPTIONS } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

function reasonLabel(reason) {
  return RETURN_REASON_OPTIONS.find((option) => option.value === reason)?.label ?? reason;
}

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

  const returnsList = data?.data ?? [];

  const stats = useMemo(() => {
    const totalReturns = returnsList.length;
    const resolved = returnsList.filter((item) => item.status === 'resolved').length;
    const refundAmount = returnsList.reduce(
      (sum, item) => sum + (item.resolutionType === 'refund' ? Number(item.refundAmount || 0) : 0),
      0,
    );
    const replacementOrders = returnsList.filter((item) => item.resolutionType === 'replacement').length;
    const scrapped = returnsList.filter((item) => item.decision === 'scrap').length;
    const returnRate = totalReturns ? Math.round((resolved / totalReturns) * 100) : 0;
    const damagePct = totalReturns ? Math.round((scrapped / totalReturns) * 100) : 0;
    return { totalReturns, returnRate, refundAmount, replacementOrders, damagePct };
  }, [returnsList]);

  const handleSubmit = (values) => {
    const action = formState.returnItem
      ? updateReturn.mutateAsync({ id: formState.returnItem.id, payload: values })
      : createReturn.mutateAsync(values);

    action.then(() => setFormState({ open: false, returnItem: null }));
  };

  const handleConfirmDelete = () => {
    deleteReturn.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'returnNumber', header: 'Return #' },
    { key: 'soNumber', header: 'Linked SO' },
    { key: 'type', header: 'Type', render: (row) => <BaseBadge variant={row.type === 'customer' ? 'warning' : 'default'}>{row.type}</BaseBadge> },
    { key: 'quantity', header: 'Qty' },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    { key: 'reason', header: 'Reason', render: (row) => reasonLabel(row.reason) },
    { key: 'createdDate', header: 'Date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.RETURNS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.returnNumber}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, returnItem: row }); }} />
          </Can>
          <Can module={MODULES.RETURNS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.returnNumber}`} onClick={(event) => { event.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Returns</h1>
          <p className="text-sm text-text-muted">Customer and courier returns, warehouse verification and cost impact.</p>
        </div>
        <Can module={MODULES.RETURNS} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, returnItem: null })}>New return</CreateButton>
        </Can>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total returns" value={stats.totalReturns} />
        <StatCard label="Return rate" value={`${stats.returnRate}%`} />
        <StatCard label="Refund amount" value={`₹${stats.refundAmount.toLocaleString('en-IN')}`} />
        <StatCard label="Replacement orders" value={stats.replacementOrders} />
        <StatCard label="Damage %" value={`${stats.damagePct}%`} />
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search returns…" className="w-72" />
      </FilterBar>

      <AppTable
        columns={columns}
        data={returnsList}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRowClick={(returnItem) => setFormState({ open: true, returnItem })}
        emptyMessage="No returns yet"
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
