import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/features/notifications/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      pushToast('success', 'Notification marked as read');
    },
  });
}
