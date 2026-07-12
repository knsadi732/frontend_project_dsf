import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

const CHANNEL_VARIANT = { in_app: 'info', email: 'success', sms: 'warning' };

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CommunicationLogTable({ logs, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'sentTime', header: 'Sent', render: (row) => formatDateTime(row.sentTime) },
    { key: 'businessEvent', header: 'Business Event' },
    { key: 'recipient', header: 'Recipient' },
    {
      key: 'channel',
      header: 'Channel',
      render: (row) => <BaseBadge variant={CHANNEL_VARIANT[row.channel] ?? 'default'}>{row.channel?.replace(/_/g, ' ')}</BaseBadge>,
    },
    { key: 'template', header: 'Template' },
    {
      key: 'deliveryStatus',
      header: 'Delivery Status',
      render: (row) => <BaseBadge variant="success">{row.deliveryStatus}</BaseBadge>,
    },
    { key: 'readTime', header: 'Read', render: (row) => formatDateTime(row.readTime) },
    { key: 'retryCount', header: 'Retries' },
  ];

  return (
    <AppTable
      columns={columns}
      data={logs}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No communications logged yet"
    />
  );
}
