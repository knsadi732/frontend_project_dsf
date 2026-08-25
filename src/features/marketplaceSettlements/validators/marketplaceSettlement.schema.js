import { z } from 'zod';

export const RETURN_TYPE_OPTIONS = [
  { value: 'none', label: 'None (kept)' },
  { value: 'customer', label: 'Customer return (CR)' },
  { value: 'courier', label: 'Courier return (RTO)' },
];

export const marketplaceSettlementSchema = z.object({
  channelId: z.string().min(1, 'Channel is required'),
  billId: z.string().optional().or(z.literal('')),
  orderId: z.string().optional().or(z.literal('')),
  productVariantId: z.string().optional().or(z.literal('')),
  settlementDate: z.string().min(1, 'Settlement date is required'),
  returnType: z.enum(['none', 'customer', 'courier']).default('none'),
  grossSaleAmount: z.coerce.number().min(0).default(0),
  commissionAmount: z.coerce.number().min(0).default(0),
  shippingCharge: z.coerce.number().min(0).default(0),
  returnCharge: z.coerce.number().min(0).default(0),
  adsCharge: z.coerce.number().min(0).default(0),
  tcsAmount: z.coerce.number().min(0).default(0),
  tdsAmount: z.coerce.number().min(0).default(0),
  netAmountReceived: z.coerce.number().min(0).default(0),
  remarks: z.string().optional(),
});
