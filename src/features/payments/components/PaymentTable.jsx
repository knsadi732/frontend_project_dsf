import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

export function PaymentTable({ payments, customersById, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'slipNumber', header: 'Slip #' },
    { key: 'customer', header: 'Customer', render: (row) => customersById?.[row.customerId]?.name ?? row.customerId },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (row) => (row.paymentMode ? <BaseBadge variant="info">{row.paymentMode.replace(/_/g, ' ')}</BaseBadge> : '—'),
    },
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
