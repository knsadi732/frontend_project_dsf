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
      // If the request never reached the server (backend down, no network),
      // the axios interceptor already pushed a NETWORK_ERROR toast — showing
      // "invalid credentials" on top of that would be misleading, since the
      // credentials were never actually checked.
      if (error?.response) {
        // Always the generic phrase, regardless of what the backend/mock
        // says — never reveal whether the identifier or the password was wrong.
        pushToast('error', TOAST_MESSAGES.INVALID_CREDENTIALS);
      } else if (!error?.request) {
        // Mock-mode rejection (a plain Error, not an axios error at all).
        pushToast('error', TOAST_MESSAGES.INVALID_CREDENTIALS);
      }
    },
  });
}
