import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePaymentsQuery } from '@/features/payments/queries/usePaymentsQuery';
import { useCreatePayment } from '@/features/payments/mutations/useCreatePayment';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { PaymentTable } from '@/features/payments/components/PaymentTable';
import { PaymentFormModal } from '@/features/payments/components/PaymentFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function PaymentsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = usePaymentsQuery({ page, pageSize });
  const { data: invoicesData } = useInvoicesQuery({ pageSize: 100 });
  const invoices = invoicesData?.data ?? [];
  const invoicesById = Object.fromEntries(invoices.map((inv) => [inv.id, inv]));
  const invoiceOptions = invoices.map((inv) => ({ value: inv.id, label: `${inv.invoiceNumber} — ${inv.party} (₹${Number(inv.balanceDue ?? inv.amount).toLocaleString('en-IN')} due)` }));

  const createPayment = useCreatePayment();

  const handleSubmit = (values) => {
    createPayment.mutateAsync(values).then(() => setFormOpen(false));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Customer payments recorded against invoices (Accounts Receivable).</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Record payment
          </AppButton>
        </Can>
      </div>

      <PaymentTable
        payments={data?.data ?? []}
        invoicesById={invoicesById}
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
        invoiceOptions={invoiceOptions}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createPayment.isPending}
      />
    </div>
  );
}
