import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { loginHistoryApi } from '@/features/profile/api';
import { queryKeys } from '@/config/queryKeys';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function useLoginHistoryQuery(userId, { page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  return useQuery({
    queryKey: queryKeys.loginHistory.list({ userId, page, pageSize }),
    queryFn: () => loginHistoryApi.list({ pageSize: 1000 }),
    select: (data) => {
      const filtered = data.data.filter((entry) => entry.userId === userId);
      const start = (page - 1) * pageSize;
      return { data: filtered.slice(start, start + pageSize), total: filtered.length };
    },
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });
}
