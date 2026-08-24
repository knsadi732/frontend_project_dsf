import { useState } from 'react';
import { usePayablesQuery } from '@/features/payables/queries/usePayablesQuery';
import { useCreatePayable } from '@/features/payables/mutations/useCreatePayable';
import { PayableFormModal } from '@/features/payables/components/PayableFormModal';
import { PayableDetailModal } from '@/features/payables/components/PayableDetailModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppSelect } from '@/components/ui/AppSelect';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { PAYABLE_STATUS_OPTIONS } from '@/features/payables/validators/payable.schema';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const PAYABLE_STATUS_VARIANT = { pending: 'warning', partial: 'warning', paid: 'success', written_off: 'danger' };

export function PayablesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPayableId, setSelectedPayableId] = useState(null);

  const { data, isLoading } = usePayablesQuery({ page, pageSize, status: status || undefined });
  const createPayable = useCreatePayable();

  const handleSubmit = (values) => {
    createPayable.mutateAsync(values).then(() => setFormOpen(false));
  };

  const columns = [
    { key: 'payableNumber', header: 'Payable #' },
    { key: 'partyName', header: 'Party' },
    { key: 'purpose', header: 'Purpose' },
    { key: 'totalAmount', header: 'Total', render: (row) => `₹${row.totalAmount.toLocaleString('en-IN')}` },
    { key: 'amountPaid', header: 'Paid', render: (row) => `₹${row.amountPaid.toLocaleString('en-IN')}` },
    { key: 'amountDue', header: 'Due', render: (row) => `₹${row.amountDue.toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={PAYABLE_STATUS_VARIANT} /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Dues owed to any party outside a vendor Purchase Order — e.g. a rent deposit paid off over time via monthly
          rent adjustments instead of up front.
        </p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>New payable</CreateButton>
        </Can>
      </div>

      <AppSelect
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          setPage(1);
        }}
        options={PAYABLE_STATUS_OPTIONS}
        placeholder="All statuses"
        className="w-48"
        aria-label="Filter by status"
      />

      <AppTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRowClick={(payable) => setSelectedPayableId(payable.id)}
        emptyMessage="No payables recorded yet"
      />

      <PayableFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createPayable.isPending}
      />

      {selectedPayableId && <PayableDetailModal payableId={selectedPayableId} onClose={() => setSelectedPayableId(null)} />}
    </div>
  );
}
