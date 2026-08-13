import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { approvalRequestApi } from '@/features/approvalRequests/api';
import { queryKeys } from '@/config/queryKeys';

export function useApprovalRequestsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.approvalRequests.list(filters),
    queryFn: () => approvalRequestApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
