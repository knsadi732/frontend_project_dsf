import { z } from 'zod';

export const rfqSchema = z.object({
  purchaseRequestId: z.string().min(1),
  vendorIds: z.array(z.string()).min(1, 'Select at least one vendor'),
  deliveryLocation: z.string().optional(),
  deliveryDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  technicalSpecifications: z.string().optional(),
  remarks: z.string().optional(),
});

export const vendorQuotationSchema = z.object({
  rfqId: z.string().min(1),
  vendorId: z.string().min(1, 'Vendor is required'),
  deliveryTimeDays: z.coerce.number().int().min(0).optional().or(z.literal('')),
  paymentTerms: z.string().optional(),
  validityDate: z.string().optional(),
  freightAmount: z.coerce.number().min(0).optional().or(z.literal('')),
  discountAmount: z.coerce.number().min(0).optional().or(z.literal('')),
  remarks: z.string().optional(),
  // Exactly one of productVariantId / itemVariantId — seeded from the RFQ's
  // own material list (VendorQuotationFormModal#emptyItemsFor), never user-picked.
  items: z
    .array(
      z.object({
        productVariantId: z.string().optional(),
        itemVariantId: z.string().optional(),
        unitPrice: z.coerce.number().min(0, 'Unit price is required'),
        gstPercentage: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
      }),
    )
    .min(1),
});
