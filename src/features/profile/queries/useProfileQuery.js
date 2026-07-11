import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/user.api';
import { queryKeys } from '@/config/queryKeys';

export function useProfileQuery(userId) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => userApi.get(userId),
    enabled: Boolean(userId),
  });
}
