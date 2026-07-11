import { useMutation } from '@tanstack/react-query';
import { pushToast } from '@/utils/toastBus';

export function useChangePassword() {
  return useMutation({
    mutationFn: () => Promise.resolve({ success: true }),
    onSuccess: () => {
      pushToast('success', 'Password changed successfully');
    },
  });
}
