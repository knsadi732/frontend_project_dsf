import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

function formatBalance(balance) {
  const sign = balance >= 0 ? 'Cr' : 'Dr';
  return `${sign} ${Math.abs(balance).toLocaleString('en-IN')}`;
}

export function LedgerTable({ entries, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-IN') },
    { key: 'particulars', header: 'Particulars' },
    { key: 'voucher', header: 'Voucher', render: (row) => <BaseBadge variant="info">{row.voucher}</BaseBadge> },
    {
      key: 'debit',
      header: 'Debit (₹)',
      render: (row) => (row.direction === 'debit' ? row.amount.toLocaleString('en-IN') : '—'),
    },
    {
      key: 'credit',
      header: 'Credit (₹)',
      render: (row) => (row.direction === 'credit' ? row.amount.toLocaleString('en-IN') : '—'),
    },
    { key: 'balance', header: 'Balance (₹)', render: (row) => formatBalance(row.balance) },
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
