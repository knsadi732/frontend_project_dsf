import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LoginHistoryTable({ entries, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'loginAt', header: 'Signed in at', render: (row) => formatDateTime(row.loginAt) },
    { key: 'device', header: 'Device' },
    { key: 'ip', header: 'IP address' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={row.status === 'success' ? 'success' : 'danger'}>{row.status}</BaseBadge>,
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
      emptyMessage="No login history yet"
    />
  );
}
