import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

const STATUS_LABEL = { pending: 'Pending', signed: 'eSign Verified' };
const STATUS_VARIANT = { pending: 'warning', signed: 'success' };

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function LoanEsignRequestTable({ requests, isLoading, page, pageSize, total, onPageChange, onPageSizeChange, onRowClick }) {
  const columns = [
    { key: 'partyName', header: 'Party' },
    { key: 'email', header: 'Email' },
    { key: 'loanAmount', header: 'Loan Amount', render: (row) => `₹${Number(row.loanAmount).toLocaleString('en-IN')}` },
    { key: 'interestRatePercent', header: 'Interest', render: (row) => `${row.interestRatePercent}%` },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_VARIANT[row.status] ?? 'default'}>{STATUS_LABEL[row.status] ?? row.status}</BaseBadge>,
    },
    { key: 'signerName', header: 'Signed By', render: (row) => row.signerName || '—' },
    { key: 'signedAt', header: 'Signed At', render: (row) => formatDateTime(row.signedAt) },
    { key: 'createdDate', header: 'Sent On' },
  ];

  return (
    <AppTable
      columns={columns}
      data={requests}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onRowClick}
      emptyMessage="No loan e-sign requests yet"
    />
  );
}
