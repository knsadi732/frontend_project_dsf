import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/features/settings/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => settingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      pushToast('success', 'Settings updated.');
    },
  });
}
