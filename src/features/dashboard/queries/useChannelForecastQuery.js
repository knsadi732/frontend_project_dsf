import { useQuery } from '@tanstack/react-query';
import { forecastApi } from '@/services/forecast.api';

export function useChannelForecastQuery(enabled = true) {
  return useQuery({
    queryKey: ['forecast', 'channel'],
    queryFn: () => forecastApi.getChannelForecast(),
    enabled,
  });
}
