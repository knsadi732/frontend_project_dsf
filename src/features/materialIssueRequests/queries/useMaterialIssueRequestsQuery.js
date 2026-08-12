import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { materialIssueRequestApi } from '@/features/materialIssueRequests/api';
import { queryKeys } from '@/config/queryKeys';

export function useMaterialIssueRequestsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.materialIssueRequests.list(filters),
    queryFn: () => materialIssueRequestApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
