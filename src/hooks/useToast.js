import { pushToast } from '@/utils/toastBus';

export function useToast() {
  return {
    success: (message) => pushToast('success', message),
    error: (message) => pushToast('error', message),
    info: (message) => pushToast('info', message),
  };
}
