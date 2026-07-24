import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

export function LedgerTable({ entries, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-IN') },
    { key: 'particulars', header: 'Particulars' },
    { key: 'voucher', header: 'Voucher', render: (row) => <BaseBadge variant="info">{row.voucher}</BaseBadge> },
    {
      key: 'debit',
      header: 'Debit (₹)',
      render: (row) => (row.debit ? <span className="text-danger">{row.debit.toLocaleString('en-IN')}</span> : '—'),
    },
    {
      key: 'credit',
      header: 'Credit (₹)',
      render: (row) => (row.credit ? <span className="text-success">{row.credit.toLocaleString('en-IN')}</span> : '—'),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={entries}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No ledger entries yet"
    />
  );
}
