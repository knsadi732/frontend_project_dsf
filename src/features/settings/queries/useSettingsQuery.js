import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/features/settings/api';
import { queryKeys } from '@/config/queryKeys';

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: () => settingsApi.get(),
  });
}
