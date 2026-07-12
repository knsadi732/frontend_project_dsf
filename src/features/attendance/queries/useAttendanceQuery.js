import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { attendanceApi } from '@/features/attendance/api';
import { queryKeys } from '@/config/queryKeys';

export function useAttendanceQuery(filters) {
  return useQuery({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: () => attendanceApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
