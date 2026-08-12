import { useQuery } from '@tanstack/react-query';
import { materialIssueRequestApi } from '@/features/materialIssueRequests/api';
import { queryKeys } from '@/config/queryKeys';

export function useMaterialIssueRequestQuery(id) {
  return useQuery({
    queryKey: queryKeys.materialIssueRequests.detail(id),
    queryFn: () => materialIssueRequestApi.get(id),
    enabled: Boolean(id),
  });
}
