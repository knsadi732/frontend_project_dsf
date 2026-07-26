import { useState } from 'react';
import { usePaymentsQuery } from '@/features/payments/queries/usePaymentsQuery';
import { useCreatePayment } from '@/features/payments/mutations/useCreatePayment';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { PaymentTable } from '@/features/payments/components/PaymentTable';
import { PaymentFormModal } from '@/features/payments/components/PaymentFormModal';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function PaymentsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = usePaymentsQuery({ page, pageSize });
  const { data: customersData } = useCustomersQuery({ pageSize: 100 });
  const customers = customersData?.data ?? [];
  const customersById = Object.fromEntries(customers.map((c) => [c.id, c]));
  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }));

  const createPayment = useCreatePayment();

  const handleSubmit = (values) => {
    createPayment.mutateAsync(values).then(() => setFormOpen(false));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Customer payments recorded (Accounts Receivable / collections).</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>Record payment</CreateButton>
        </Can>
      </div>

      <PaymentTable
        payments={data?.data ?? []}
        customersById={customersById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <PaymentFormModal
        open={formOpen}
        customerOptions={customerOptions}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createPayment.isPending}
      />
    </div>
  );
}
