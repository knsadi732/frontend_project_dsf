import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { getSalesOrderStage, getSalesOrderStageLabel, DELIVERY_STAGE_BADGE_VARIANT } from '@/features/sales/utils/salesOrderStage';

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

// The "Delivery Status" column shows the linked Sales Order's real
// fulfillment stage (Sales Order Pending → Production Pending → Warehouse →
// Dispatched → Delivered) when the logged event is tied to one; otherwise it
// falls back to the generic message-delivery flag (this mock has no real
// SMTP/SMS gateway, so that flag is always "delivered").
function DeliveryStatusCell({ row, salesOrdersById }) {
  const salesOrder = salesOrdersById?.[row.entityId];
  if (salesOrder) {
    const stage = getSalesOrderStage(salesOrder);
    return <BaseBadge variant={DELIVERY_STAGE_BADGE_VARIANT[stage] ?? 'default'}>{getSalesOrderStageLabel(salesOrder)}</BaseBadge>;
  }
  return <BaseBadge variant="success">{row.deliveryStatus}</BaseBadge>;
}

export function CommunicationLogTable({ logs, salesOrdersById, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
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
      render: (row) => <DeliveryStatusCell row={row} salesOrdersById={salesOrdersById} />,
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
