import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { roleApi } from '@/features/roles/api';
import { queryKeys } from '@/config/queryKeys';

export function useRolesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.roles.list(filters),
    queryFn: () => roleApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
