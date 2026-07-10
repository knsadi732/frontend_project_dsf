import { BaseCard } from '@/components/ui/BaseCard';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { cn } from '@/utils/cn';

export function NotificationList({ notifications, isLoading, onMarkRead, markingId }) {
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
    </BaseCard>
  );
}
