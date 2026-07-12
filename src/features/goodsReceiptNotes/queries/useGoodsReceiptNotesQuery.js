import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { goodsReceiptNoteApi } from '@/features/goodsReceiptNotes/api';
import { queryKeys } from '@/config/queryKeys';

export function useGoodsReceiptNotesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.goodsReceiptNotes.list(filters),
    queryFn: () => goodsReceiptNoteApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
