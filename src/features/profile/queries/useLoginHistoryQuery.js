import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { loginHistoryApi } from '@/features/profile/api';
import { queryKeys } from '@/config/queryKeys';

export function useLoginHistoryQuery(userId) {
  return useQuery({
    queryKey: queryKeys.loginHistory.list({ userId }),
    queryFn: () => loginHistoryApi.list({ pageSize: 100 }),
    select: (data) => ({ ...data, data: data.data.filter((entry) => entry.userId === userId) }),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });
}
