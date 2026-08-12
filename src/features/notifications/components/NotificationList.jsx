import { useState } from 'react';
import { BaseCard } from '@/components/ui/BaseCard';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS, ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateSalesOrder } from '@/features/sales/mutations/useUpdateSalesOrder';
import { SalesOrderDetailModal } from '@/features/sales/components/SalesOrderDetailModal';
import { cn } from '@/utils/cn';

const SALES_REVIEW_ROLES = [ROLES.SALES, ROLES.OWNER, ROLES.SUPER_ADMIN];
const WAREHOUSE_PACK_ROLES = [ROLES.INVENTORY, ROLES.DISPATCH, ROLES.OWNER, ROLES.SUPER_ADMIN];

const TYPE_VARIANT = {
  information: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  approval: 'info',
  reminder: 'warning',
};

export function NotificationList({ notifications, isLoading, onMarkRead, onArchive, markingId, archivingId }) {
  const { roles } = useAuth();
  const updateSalesOrder = useUpdateSalesOrder();
  const [detailSalesOrderId, setDetailSalesOrderId] = useState(null);

  const actOnSalesOrder = (item, status) => {
    updateSalesOrder.mutate(
      { id: item.entityId, status },
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
        {notifications.map((item) => {
          const isUnread = item.status === 'unread';
          return (
          <li key={item.id} className="flex items-start gap-3 px-4 py-3">
            <span
              className={cn(
                'mt-1.5 size-2 shrink-0 rounded-full',
                isUnread ? 'bg-primary' : 'bg-transparent',
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={cn('text-sm text-text', isUnread && 'font-semibold')}>{item.title}</p>
                <BaseBadge variant={TYPE_VARIANT[item.type] ?? 'default'}>{item.type ?? 'information'}</BaseBadge>
              </div>
              <p className="text-sm text-text-muted">{item.message}</p>
              <p className="mt-1 text-xs text-text-muted">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            {isUnread && item.category === 'sales_order_review' && roles.some((role) => SALES_REVIEW_ROLES.includes(role)) && (
              <div className="flex shrink-0 gap-1">
                <AppButton variant="ghost" size="sm" onClick={() => setDetailSalesOrderId(item.entityId)}>
                  View details
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="sm"
                  loading={updateSalesOrder.isPending}
                  onClick={() => actOnSalesOrder(item, 'confirmed')}
                >
                  Confirm order
                </AppButton>
              </div>
            )}

            {isUnread && item.category === 'sales_order_packing' && roles.some((role) => WAREHOUSE_PACK_ROLES.includes(role)) && (
              <div className="flex shrink-0 gap-1">
                <AppButton variant="ghost" size="sm" onClick={() => setDetailSalesOrderId(item.entityId)}>
                  View details
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="sm"
                  loading={updateSalesOrder.isPending}
                  onClick={() => actOnSalesOrder(item, 'packed')}
                >
                  Mark packed
                </AppButton>
              </div>
            )}

            <Can module={MODULES.NOTIFICATIONS} action={ACTIONS.EDIT}>
              <div className="flex shrink-0 gap-1">
                {isUnread && (
                  <AppButton
                    variant="ghost"
                    size="sm"
                    loading={markingId === item.id}
                    onClick={() => onMarkRead(item.id)}
                  >
                    Mark as read
                  </AppButton>
                )}
                {item.status !== 'archived' && (
                  <AppButton
                    variant="ghost"
                    size="sm"
                    loading={archivingId === item.id}
                    onClick={() => onArchive(item.id)}
                  >
                    Archive
                  </AppButton>
                )}
              </div>
            </Can>
          </li>
          );
        })}
      </ul>

      <SalesOrderDetailModal
        open={Boolean(detailSalesOrderId)}
        onClose={() => setDetailSalesOrderId(null)}
        salesOrderId={detailSalesOrderId}
      />
    </BaseCard>
  );
}
