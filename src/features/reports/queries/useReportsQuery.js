import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reportApi } from '@/features/reports/api';
import { queryKeys } from '@/config/queryKeys';

export function useReportsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.reports.list(filters),
    queryFn: () => reportApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
