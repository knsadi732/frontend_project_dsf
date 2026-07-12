import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { qualityInspectionApi } from '@/features/qualityInspections/api';
import { queryKeys } from '@/config/queryKeys';

export function useQualityInspectionsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.qualityInspections.list(filters),
    queryFn: () => qualityInspectionApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
