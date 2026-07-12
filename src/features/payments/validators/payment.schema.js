import { z } from 'zod';

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'neft', label: 'NEFT' },
  { value: 'rtgs', label: 'RTGS' },
  { value: 'imps', label: 'IMPS' },
];

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.enum(['upi', 'bank_transfer', 'credit_card', 'debit_card', 'cash', 'cheque', 'neft', 'rtgs', 'imps']).default('bank_transfer'),
  paidDate: z.string().min(1, 'Paid date is required'),
});
