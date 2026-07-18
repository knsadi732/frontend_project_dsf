import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { statutoryAuditApi } from '@/features/compliance/api';
import { queryKeys } from '@/config/queryKeys';

export function useStatutoryAuditsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.statutoryAudits.list(filters),
    queryFn: () => statutoryAuditApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
