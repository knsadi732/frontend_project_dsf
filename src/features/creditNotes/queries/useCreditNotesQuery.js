import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { creditNoteApi } from '@/features/creditNotes/api';
import { queryKeys } from '@/config/queryKeys';

export function useCreditNotesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.creditNotes.list(filters),
    queryFn: () => creditNoteApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
