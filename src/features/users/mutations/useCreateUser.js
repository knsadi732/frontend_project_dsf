import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/features/users/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('User'));
    },
  });
}
