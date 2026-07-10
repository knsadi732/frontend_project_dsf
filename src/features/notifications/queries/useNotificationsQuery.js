import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { notificationApi } from '@/features/notifications/api';
import { queryKeys } from '@/config/queryKeys';

export function useNotificationsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => notificationApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
