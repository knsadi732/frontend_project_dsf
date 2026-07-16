// Real order-fulfillment stage for a Sales Order — used anywhere a "where is
// this order right now" status needs to be shown (e.g. the Communication
// Log's Delivery Status column), as opposed to a message-delivery flag.
// There's no real courier/tracking integration in this mock, so "Delivered"
// is a manual confirmation step (see the "Mark Delivered" action) standing
// in for a courier webhook.
export const DELIVERY_STAGE_OPTIONS = [
  { value: 'sales_order_pending', label: 'Sales Order Pending' },
  { value: 'production_pending', label: 'Production Pending' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];

export const DELIVERY_STAGE_BADGE_VARIANT = {
  sales_order_pending: 'warning',
  production_pending: 'info',
  warehouse: 'info',
  dispatched: 'info',
  delivered: 'success',
  cancelled: 'danger',
  rejected: 'danger',
};

export function getSalesOrderStage(salesOrder) {
  if (!salesOrder) return null;
  if (salesOrder.status === 'cancelled') return 'cancelled';
  if (salesOrder.status === 'rejected') return 'rejected';
  if (salesOrder.deliveredAt) return 'delivered';
  if (salesOrder.dispatchNoteGeneratedAt || salesOrder.status === 'completed') return 'dispatched';
  if (salesOrder.pickListGeneratedAt) return 'warehouse';
  if (salesOrder.status === 'in_progress') return 'production_pending';
  return 'sales_order_pending';
}

export function getSalesOrderStageLabel(salesOrder) {
  const stage = getSalesOrderStage(salesOrder);
  return DELIVERY_STAGE_OPTIONS.find((option) => option.value === stage)?.label ?? '—';
}
