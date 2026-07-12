import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/features/attendance/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => attendanceApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Attendance record'));
    },
  });
}
