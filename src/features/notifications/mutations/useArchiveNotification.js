import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/features/notifications/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      pushToast('success', 'Notification archived');
    },
  });
}
