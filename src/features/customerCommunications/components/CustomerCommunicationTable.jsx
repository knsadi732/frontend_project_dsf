import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

const CHANNEL_VARIANT = { call: 'info', email: 'success', sms: 'warning', whatsapp: 'success', note: 'default' };

export function CustomerCommunicationTable({ communications, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'date', header: 'Date' },
    {
      key: 'channel',
      header: 'Channel',
      render: (row) => <BaseBadge variant={CHANNEL_VARIANT[row.channel] ?? 'default'}>{row.channel}</BaseBadge>,
    },
    { key: 'notes', header: 'Notes' },
    { key: 'contactedBy', header: 'Contacted By', render: (row) => row.contactedBy || '—' },
  ];

  return (
    <AppTable
      columns={columns}
      data={communications}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No communication history yet"
    />
  );
}
