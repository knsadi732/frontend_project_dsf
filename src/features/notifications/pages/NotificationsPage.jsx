import { useNotificationsQuery } from '@/features/notifications/queries/useNotificationsQuery';
import { useMarkNotificationRead } from '@/features/notifications/mutations/useMarkNotificationRead';
import { useMarkAllNotificationsRead } from '@/features/notifications/mutations/useMarkAllNotificationsRead';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

export function NotificationsPage() {
  const { data, isLoading } = useNotificationsQuery();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const hasUnread = notifications.some((item) => !item.read);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Notifications</h1>
          <p className="text-sm text-text-muted">Stay on top of updates across your workspace.</p>
        </div>
        {hasUnread && (
          <Can module={MODULES.NOTIFICATIONS} action={ACTIONS.EDIT}>
            <AppButton
              variant="secondary"
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </AppButton>
          </Can>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onMarkRead={(id) => markRead.mutate(id)}
        markingId={markRead.isPending ? markRead.variables : null}
      />
    </div>
  );
}
