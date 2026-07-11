import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/auth.api';
import { useAuthStore } from '@/store/authStore';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession(data);
      pushToast('success', TOAST_MESSAGES.LOGIN_SUCCESS);
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? error?.message ?? TOAST_MESSAGES.INVALID_CREDENTIALS;
      pushToast('error', message);
    },
  });
}
