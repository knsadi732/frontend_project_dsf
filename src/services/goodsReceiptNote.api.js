import { createCrudApi } from '@/services/api/createCrudApi';
import { onGrnStatusChange } from '@/services/api/businessRules';

const MOCK_GRNS = [];

export const goodsReceiptNoteApi = createCrudApi('goodsReceiptNotes', MOCK_GRNS, {
  hooks: { afterUpdate: onGrnStatusChange },
});
