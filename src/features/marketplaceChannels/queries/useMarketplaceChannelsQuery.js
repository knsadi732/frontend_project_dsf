import { useQuery } from '@tanstack/react-query';
import { marketplaceChannelApi } from '@/features/marketplaceChannels/api';
import { queryKeys } from '@/config/queryKeys';

export function useMarketplaceChannelsQuery(params) {
  return useQuery({
    queryKey: queryKeys.marketplaceChannels.list(params),
    queryFn: () => marketplaceChannelApi.list(params),
  });
}
