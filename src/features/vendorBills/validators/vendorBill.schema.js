import { z } from 'zod';

export const vendorBillSchema = z.object({
  billNumber: z.string().min(1, 'Bill number is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  purchaseOrderId: z.string().min(1, 'Purchase order is required'),
  grnId: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  gstAmount: z.coerce.number().nonnegative().default(0),
  dueDate: z.string().min(1, 'Due date is required'),
});

export const vendorPaymentSchema = z.object({
  vendorBillId: z.string().min(1, 'Vendor bill is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.enum(['bank_transfer', 'neft', 'rtgs', 'imps', 'cheque']).default('bank_transfer'),
  paidDate: z.string().min(1, 'Paid date is required'),
});
