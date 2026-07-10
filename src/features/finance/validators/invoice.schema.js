import { z } from 'zod';
import { PAYMENT_STATUS } from '@/constants/statusEnums';

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  party: z.string().min(1, 'Party is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(Object.values(PAYMENT_STATUS)).default(PAYMENT_STATUS.UNPAID),
});
