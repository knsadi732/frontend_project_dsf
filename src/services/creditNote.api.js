import { createCrudApi } from '@/services/api/createCrudApi';
import { creditNotes } from '@/services/api/mockDb';

export const creditNoteApi = createCrudApi('creditNotes', creditNotes, { dateField: 'createdDate' });
