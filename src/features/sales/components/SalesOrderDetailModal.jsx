import { useSalesOrderQuery } from '@/features/sales/queries/useSalesOrderQuery';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BaseLoader } from '@/components/ui/BaseLoader';

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
  const { data: customersData } = useCustomersQuery({ pageSize: 200 });
  const customersById = Object.fromEntries((customersData?.data ?? []).map((customer) => [customer.id, customer]));
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((product) => [product.id, product]));
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500 });
  const variantsById = Object.fromEntries((variantsData?.data ?? []).map((variant) => [variant.id, variant]));

  return (
    <AppModal open={open} onClose={onClose} title={order ? `Sales order — ${order.orderNumber}` : 'Sales order'} className="max-w-2xl">
      {isLoading || !order ? (
        <BaseLoader />
      ) : (
        <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
          <div className="flex flex-col">
            <DetailRow label="Customer" value={customersById[order.customerId]?.name ?? order.customerId} />
            <DetailRow label="Order date" value={order.orderDate} />
            <DetailRow label="Status" value={<StatusBadge status={order.status} />} />
            <DetailRow label="Payment status" value={<StatusBadge status={order.paymentStatus} />} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Items ordered</h3>
            <div className="grid grid-cols-[1fr_5rem_6rem_7rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
              <span>Product</span>
              <span>Qty</span>
              <span>Rate (₹)</span>
              <span className="text-right">Amount</span>
            </div>
            {(order.items ?? []).map((item, index) => {
              const variant = variantsById[item.productVariantId];
              const productName = productsById[variant?.productId]?.name ?? variant?.sku ?? item.productVariantId;
              return (
                <div key={index} className="grid grid-cols-[1fr_5rem_6rem_7rem] gap-2 border-b border-border py-1.5 text-sm last:border-0">
                  <span className="text-text">{productName}</span>
                  <span className="text-text-muted">{item.quantity}</span>
                  <span className="text-text-muted">₹{Number(item.unitPrice ?? 0).toLocaleString('en-IN')}</span>
                  <span className="text-right text-text">₹{Number(item.lineTotal ?? 0).toLocaleString('en-IN')}</span>
                </div>
              );
            })}
            <div className="flex justify-end border-t border-border pt-2 text-sm font-semibold text-text">
              Total: ₹{Number(order.total ?? 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}
    </AppModal>
  );
}
