import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/features/departments/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => departmentApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Department'));
    },
  });
}
