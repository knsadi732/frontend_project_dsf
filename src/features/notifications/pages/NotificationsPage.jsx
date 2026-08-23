import { useMemo, useState } from 'react';
import { usePersistedTab } from '@/hooks/usePersistedTab';
import { useNotificationsQuery } from '@/features/notifications/queries/useNotificationsQuery';
import { useMarkNotificationRead } from '@/features/notifications/mutations/useMarkNotificationRead';
import { useMarkAllNotificationsRead } from '@/features/notifications/mutations/useMarkAllNotificationsRead';
import { useArchiveNotification } from '@/features/notifications/mutations/useArchiveNotification';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { CommunicationLogsPanel } from '@/features/communicationLogs';
import { useCommunicationLogsQuery } from '@/features/communicationLogs/queries/useCommunicationLogsQuery';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const TABS = [
  { key: 'notifications', label: 'Notifications' },
  { key: 'communicationLogs', label: 'Communication Logs' },
];

const TYPE_FILTER_OPTIONS = [
  { value: 'information', label: 'Information' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'approval', label: 'Approval' },
  { value: 'reminder', label: 'Reminder' },
];

export function NotificationsPage() {
  const [activeTab, setActiveTab] = usePersistedTab('notifications', 'notifications');
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useNotificationsQuery();
  const { data: logsData } = useCommunicationLogsQuery();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const archiveNotification = useArchiveNotification();

  const notifications = data?.data ?? [];
  const visibleNotifications = notifications
    .filter((item) => item.status !== 'archived')
    .filter((item) => !typeFilter || item.type === typeFilter);
  const hasUnread = notifications.some((item) => item.status === 'unread');

  const logs = logsData?.data ?? [];
  const stats = useMemo(() => {
    const totalNotifications = notifications.length;
    const totalEmails = logs.filter((log) => log.channel === 'email').length;
    const readCount = notifications.filter((item) => item.status !== 'unread').length;
    const readRate = totalNotifications ? Math.round((readCount / totalNotifications) * 100) : 0;
    return { totalNotifications, totalEmails, readRate };
  }, [notifications, logs]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Notifications</h1>
          <p className="text-sm text-text-muted">Stay on top of updates across your workspace.</p>
        </div>
        {activeTab === 'notifications' && hasUnread && (
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total notifications" value={stats.totalNotifications} />
        <StatCard label="Simulated emails sent" value={stats.totalEmails} />
        <StatCard label="Read rate" value={`${stats.readRate}%`} />
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'notifications' && (
        <>
          <AppSelect
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            options={TYPE_FILTER_OPTIONS}
            placeholder="All types"
            className="w-48"
            aria-label="Filter by type"
          />

          <NotificationList
            notifications={visibleNotifications}
            isLoading={isLoading}
            onMarkRead={(id) => markRead.mutate(id)}
            onArchive={(id) => archiveNotification.mutate(id)}
            markingId={markRead.isPending ? markRead.variables : null}
            archivingId={archiveNotification.isPending ? archiveNotification.variables : null}
          />
        </>
      )}

      {activeTab === 'communicationLogs' && <CommunicationLogsPanel />}
    </div>
  );
}
