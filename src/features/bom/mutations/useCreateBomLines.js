import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bomApi } from '@/features/bom/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

// Bulk create for the BOM builder — one product, many raw material lines
// added in a single screen. The backend only knows single-line create
// (bom.validator.js), so this fires one POST /bom per line and settles
// together; a partial failure still leaves whichever lines succeeded saved
// (each is its own row), so the error surfaces which ones didn't land.
export function useCreateBomLines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, lines }) =>
      Promise.all(lines.map((line) => bomApi.create({ productId, ...line }))),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bom.all });
      pushToast('success', `${created.length} BOM line${created.length > 1 ? 's' : ''} added.`);
    },
  });
}
