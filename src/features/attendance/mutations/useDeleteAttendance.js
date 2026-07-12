import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/features/attendance/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Attendance record'));
    },
  });
}
