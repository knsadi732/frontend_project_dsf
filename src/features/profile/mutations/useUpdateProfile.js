import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/user.api';
import { queryKeys } from '@/config/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateProfile(userId) {
  const queryClient = useQueryClient();
  const updateStoredUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (payload) => userApi.update(userId, payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      updateStoredUser(user);
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Profile'));
    },
  });
}
