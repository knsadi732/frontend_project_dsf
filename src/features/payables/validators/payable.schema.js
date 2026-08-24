import { z } from 'zod';

export const PAYABLE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'written_off', label: 'Written off' },
];

export const payableSchema = z.object({
  partyName: z.string().min(1, 'Party name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  totalAmount: z.coerce.number().positive('Amount must be greater than 0'),
  dueDate: z.string().optional().or(z.literal('')),
  remarks: z.string().optional(),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paidAt: z.string().optional(),
  remarks: z.string().optional(),
});
