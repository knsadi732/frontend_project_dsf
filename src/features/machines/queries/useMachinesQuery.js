import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { machineApi } from '@/features/machines/api';
import { queryKeys } from '@/config/queryKeys';

export function useMachinesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.machines.list(filters),
    queryFn: () => machineApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
