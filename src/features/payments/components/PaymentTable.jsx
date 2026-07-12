import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

export function PaymentTable({ payments, invoicesById, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'invoice', header: 'Invoice', render: (row) => invoicesById?.[row.invoiceId]?.invoiceNumber ?? '—' },
    { key: 'party', header: 'Party', render: (row) => invoicesById?.[row.invoiceId]?.party ?? '—' },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    { key: 'method', header: 'Method', render: (row) => <BaseBadge variant="info">{row.method?.replace(/_/g, ' ')}</BaseBadge> },
    { key: 'paidDate', header: 'Paid date' },
  ];

  return (
    <AppTable
      columns={columns}
      data={payments}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No payments recorded yet"
    />
  );
}
