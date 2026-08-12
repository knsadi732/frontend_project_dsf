import { useQuery } from '@tanstack/react-query';
import { rfqApi } from '@/features/rfqs/api';
import { queryKeys } from '@/config/queryKeys';

// Detail view: RFQ + invited vendors + the PR's material list + every
// vendor quotation received so far (rfq.service.js getRfq) — this is the
// payload the comparison table and "record quotation" form are built from.
export function useRfqQuery(id) {
  return useQuery({
    queryKey: queryKeys.rfqs.detail(id),
    queryFn: () => rfqApi.get(id),
    enabled: Boolean(id),
  });
}
