import { useSalesOrderQuery } from '@/features/sales/queries/useSalesOrderQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text">{value || '—'}</span>
    </div>
  );
}

export function SalesOrderDetailModal({ open, onClose, salesOrderId }) {
  const { data: order, isLoading } = useSalesOrderQuery(salesOrderId);
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((product) => [product.id, product]));

  return (
    <AppModal open={open} onClose={onClose} title={order ? `Sales order — ${order.soNumber}` : 'Sales order'} className="max-w-2xl">
      {isLoading || !order ? (
        <BaseLoader />
      ) : (
        <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
          <div className="flex flex-col">
            <DetailRow label="Customer" value={order.customer} />
            <DetailRow label="Order date" value={order.orderDate} />
            <DetailRow
              label="Status"
              value={<BaseBadge variant={STATUS_BADGE_VARIANT[order.status] ?? 'default'}>{order.status}</BaseBadge>}
            />
            <DetailRow label="Dispatch / ETA" value={order.dispatchDate ? `Dispatch ${order.dispatchDate}` : order.productionEta ? `ETA ${order.productionEta}` : '—'} />
            <DetailRow label="Invoice" value={order.invoiceNumber} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Items ordered</h3>
            <div className="grid grid-cols-[1fr_5rem_6rem_7rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
              <span>Product</span>
              <span>Qty</span>
              <span>Rate (₹)</span>
              <span className="text-right">Amount</span>
            </div>
            {order.items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_5rem_6rem_7rem] gap-2 border-b border-border py-1.5 text-sm last:border-0">
                <span className="text-text">{productsById[item.productId]?.name ?? item.productId}</span>
                <span className="text-text-muted">{item.quantity}</span>
                <span className="text-text-muted">₹{Number(item.rate).toLocaleString('en-IN')}</span>
                <span className="text-right text-text">₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-end border-t border-border pt-2 text-sm font-semibold text-text">
              Total: ₹{Number(order.total).toLocaleString('en-IN')}
            </div>
          </div>

          {(order.linkedWorkOrders?.length > 0 || order.invoiceNumber) && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Linked</h3>
              <div className="flex flex-wrap gap-1">
                {order.linkedWorkOrders?.map((wo) => (
                  <BaseBadge key={wo} variant="info">
                    {wo}
                  </BaseBadge>
                ))}
                {order.invoiceNumber && <BaseBadge variant="success">{order.invoiceNumber}</BaseBadge>}
              </div>
            </div>
          )}
        </div>
      )}
    </AppModal>
  );
}
