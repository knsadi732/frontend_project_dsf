import { createCrudApi } from '@/services/api/createCrudApi';
import { customerCommunications } from '@/services/api/mockDb';

// Ch5.10 Communication History — a simple append-only log of SMS/email/call/
// WhatsApp/notes with a customer; no update/delete, matches how a real
// communication trail would be immutable.
export const customerCommunicationApi = createCrudApi('customerCommunications', customerCommunications, {
  dateField: 'date',
});
