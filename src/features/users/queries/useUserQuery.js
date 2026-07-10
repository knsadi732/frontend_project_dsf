import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/features/users/api';
import { queryKeys } from '@/config/queryKeys';

export function useUserQuery(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.get(id),
    enabled: Boolean(id),
  });
}
