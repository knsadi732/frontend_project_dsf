// Real order-fulfillment stage for a Sales Order — used anywhere a "where is
// this order right now" status needs to be shown (e.g. the Communication
// Log's Delivery Status column). Backed directly by the real pipeline status
// (order.service.js ORDER_STATUS_PIPELINE: pending -> confirmed -> packed ->
// dispatched -> delivered -> completed) — there's no separate mock flag.
export const DELIVERY_STAGE_OPTIONS = [
  { value: 'sales_order_pending', label: 'Sales Order Pending' },
  { value: 'production_pending', label: 'Production Pending' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
];

export const DELIVERY_STAGE_BADGE_VARIANT = {
  sales_order_pending: 'warning',
  production_pending: 'info',
  warehouse: 'info',
  dispatched: 'info',
  delivered: 'success',
};

export function getSalesOrderStage(salesOrder) {
  if (!salesOrder) return null;
  switch (salesOrder.status) {
    case 'delivered':
    case 'completed':
      return 'delivered';
    case 'dispatched':
      return 'dispatched';
    case 'packed':
      return 'warehouse';
    case 'confirmed':
      return 'production_pending';
    default:
      return 'sales_order_pending';
  }
}

export function getSalesOrderStageLabel(salesOrder) {
  const stage = getSalesOrderStage(salesOrder);
  return DELIVERY_STAGE_OPTIONS.find((option) => option.value === stage)?.label ?? '—';
}
