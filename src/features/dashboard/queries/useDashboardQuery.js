import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { queryKeys } from '@/config/queryKeys';

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: dashboardApi.summary,
  });
}
