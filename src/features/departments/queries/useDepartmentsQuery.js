import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { departmentApi } from '@/features/departments/api';
import { queryKeys } from '@/config/queryKeys';

export function useDepartmentsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.departments.list(filters),
    queryFn: () => departmentApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
