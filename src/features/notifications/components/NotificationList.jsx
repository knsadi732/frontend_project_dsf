import { useState } from 'react';
import { BaseCard } from '@/components/ui/BaseCard';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS, ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateSalesOrder } from '@/features/sales/mutations/useUpdateSalesOrder';
import { SalesOrderDetailModal } from '@/features/sales/components/SalesOrderDetailModal';
import { ORDER_STATUS } from '@/constants/statusEnums';
import { cn } from '@/utils/cn';

const SALES_REVIEW_ROLES = [ROLES.SALES, ROLES.OWNER, ROLES.SUPER_ADMIN];
const WAREHOUSE_PACK_ROLES = [ROLES.INVENTORY, ROLES.DISPATCH, ROLES.OWNER, ROLES.SUPER_ADMIN];

export function NotificationList({ notifications, isLoading, onMarkRead, markingId }) {
  const { roles } = useAuth();
  const updateSalesOrder = useUpdateSalesOrder();
  const [detailSalesOrderId, setDetailSalesOrderId] = useState(null);

  const actOnSalesOrder = (item, status) => {
    updateSalesOrder.mutate(
      { id: item.entityId, payload: { status } },
      { onSuccess: () => onMarkRead(item.id) },
    );
  };

  if (isLoading) {
    return (
      <BaseCard>
        <BaseLoader />
      </BaseCard>
    );
  }

  if (!notifications.length) {
    return (
      <BaseCard>
        <p className="py-10 text-center text-sm text-text-muted">You're all caught up</p>
      </BaseCard>
    );
  }

  return (
    <BaseCard>
      <ul className="divide-y divide-border">
        {notifications.map((item) => (
          <li key={item.id} className="flex items-start gap-3 px-4 py-3">
            <span
              className={cn(
                'mt-1.5 size-2 shrink-0 rounded-full',
                item.read ? 'bg-transparent' : 'bg-primary',
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm text-text', !item.read && 'font-semibold')}>{item.title}</p>
              <p className="text-sm text-text-muted">{item.message}</p>
              <p className="mt-1 text-xs text-text-muted">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            {!item.read && item.type === 'sales_order_review' && roles.some((role) => SALES_REVIEW_ROLES.includes(role)) && (
              <div className="flex shrink-0 gap-1">
                <AppButton variant="ghost" size="sm" onClick={() => setDetailSalesOrderId(item.entityId)}>
                  View details
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="sm"
                  loading={updateSalesOrder.isPending}
                  onClick={() => actOnSalesOrder(item, ORDER_STATUS.APPROVED)}
                >
                  Accept
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger/10"
                  loading={updateSalesOrder.isPending}
                  onClick={() => actOnSalesOrder(item, ORDER_STATUS.REJECTED)}
                >
                  Reject
                </AppButton>
              </div>
            )}

            {!item.read && item.type === 'sales_order_packing' && roles.some((role) => WAREHOUSE_PACK_ROLES.includes(role)) && (
              <div className="flex shrink-0 gap-1">
                <AppButton variant="ghost" size="sm" onClick={() => setDetailSalesOrderId(item.entityId)}>
                  View details
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="sm"
                  loading={updateSalesOrder.isPending}
                  onClick={() => actOnSalesOrder(item, ORDER_STATUS.COMPLETED)}
                >
                  Mark order ready
                </AppButton>
              </div>
            )}

            <Can module={MODULES.NOTIFICATIONS} action={ACTIONS.EDIT}>
              {!item.read && (
                <AppButton
                  variant="ghost"
                  size="sm"
                  loading={markingId === item.id}
                  onClick={() => onMarkRead(item.id)}
                >
                  Mark as read
                </AppButton>
              )}
            </Can>
          </li>
        ))}
      </ul>

      <SalesOrderDetailModal
        open={Boolean(detailSalesOrderId)}
        onClose={() => setDetailSalesOrderId(null)}
        salesOrderId={detailSalesOrderId}
      />
    </BaseCard>
  );
}
