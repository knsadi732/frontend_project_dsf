import { useQuery } from '@tanstack/react-query';
import { forecastApi } from '@/services/forecast.api';

export function useSalesForecastQuery(enabled = true) {
  return useQuery({
    queryKey: ['forecast', 'sales'],
    queryFn: () => forecastApi.getSalesForecast(),
    enabled,
  });
}
