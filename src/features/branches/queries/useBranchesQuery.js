import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { branchApi } from '@/features/branches/api';
import { queryKeys } from '@/config/queryKeys';

export function useBranchesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.branches.list(filters),
    queryFn: () => branchApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
