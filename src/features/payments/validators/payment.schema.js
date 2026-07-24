import { z } from 'zod';

// ApiList.md's POST /finance/payment-slips only accepts these 4 modes —
// narrower than Chapter 15's fuller Customer Payment method list
// (cheque/NEFT/RTGS/IMPS aren't supported on this endpoint).
export const PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
];

export const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentMode: z.enum(['cash', 'upi', 'card', 'bank_transfer']).optional(),
});
