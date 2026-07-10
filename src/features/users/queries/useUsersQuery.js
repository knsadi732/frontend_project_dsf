import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { userApi } from '@/features/users/api';
import { queryKeys } from '@/config/queryKeys';

export function useUsersQuery(filters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
