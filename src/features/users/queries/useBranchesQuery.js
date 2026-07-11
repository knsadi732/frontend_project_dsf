import { useQuery } from '@tanstack/react-query';
import { branchApi } from '@/services/branch.api';
import { queryKeys } from '@/config/queryKeys';

export function useBranchesQuery() {
  return useQuery({
    queryKey: queryKeys.branches.list({}),
    queryFn: () => branchApi.list({ pageSize: 100 }),
  });
}
