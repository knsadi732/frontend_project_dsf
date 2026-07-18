import { createCrudApi } from '@/services/api/createCrudApi';
import { onPaymentCreate } from '@/services/api/businessRules';

export const MOCK_PAYMENTS = [];

export const paymentApi = createCrudApi('payments', MOCK_PAYMENTS, {
  hooks: { afterCreate: onPaymentCreate },
});
