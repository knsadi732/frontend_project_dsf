import { z } from 'zod';

// Real backend pipeline (order.service.js transitionOrder / order.validator.js
// transitionStatus): pending -> confirmed -> packed -> dispatched -> delivered
// -> completed, strictly one step at a time (assertTransition). No draft/
// approved/rejected/cancelled states exist here — those were mock-era values.
export const ORDER_STATUS_PIPELINE = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'completed'];
export const PAYMENT_STATUS_OPTIONS = ['partial', 'paid', 'refunded'];

// Only 'retail' is B2C — every other direct customer_type is a business,
// identified by GSTIN rather than a personal phone number.
export const B2B_CUSTOMER_TYPES = ['wholesale', 'distributor', 'dealer', 'corporate', 'franchise'];

export const salesOrderItemSchema = z.object({
  productVariantId: z.string().min(1, 'Product variant is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
});

// Real backend body (order.validator.js createOrder): { branchId?, warehouseId
// (required), customerId (required), items: [{productVariantId, quantity}] }.
// unitPrice/taxRate/lineTotal are computed server-side from the variant's
// selling_price/gst_percentage — never sent by the client, and there's no
// soNumber/rate field at all (order.service.js createOrder).
//
// customerId is conditionally required: the form lets the user either pick
// an existing customer (customerMode 'existing', customerId required) or add
// one inline right here (customerMode 'new') — the modal creates that
// customer first and substitutes its id before this payload ever reaches the
// order API, so customerId itself stays optional at the schema level.
//
// A new customer is first split 'direct' (a real buyer you can call) vs
// 'marketplace' (a Meesho/Flipkart/Amazon buyer — the platform masks phone/
// email, so the channel is required instead and phone is optional; backend
// customer_type 'marketplace'). A 'direct' customer then picks its own
// customer_type from the full set the Customers module itself offers
// (retail/wholesale/distributor/dealer/corporate/franchise — see
// CUSTOMER_TYPE_OPTIONS in customers/validators/customer.schema.js) rather
// than being hardcoded to 'retail'; party.validator.js CUSTOMER_TYPES is the
// backend source of truth for all of these.
export const salesOrderSchema = z
  .object({
    branchId: z.string().optional(),
    warehouseId: z.string().min(1, 'Warehouse is required'),
    customerMode: z.enum(['existing', 'new']).default('existing'),
    customerId: z.string().optional(),
    newCustomerType: z.enum(['direct', 'marketplace']).default('direct'),
    newCustomerDirectType: z.enum(['retail', 'wholesale', 'distributor', 'dealer', 'corporate', 'franchise']).default('retail'),
    newCustomerName: z.string().optional(),
    newCustomerPhone: z.string().optional(),
    newCustomerEmail: z.string().optional(),
    newCustomerGstin: z.string().optional(),
    newCustomerChannelId: z.string().optional(),
    // Delivery address — required for every new customer regardless of type;
    // DS Footwear ships the order either way, marketplace included.
    newCustomerAddress: z.string().optional(),
    newCustomerCity: z.string().optional(),
    newCustomerState: z.string().optional(),
    newCustomerPostalCode: z.string().optional(),
    // OTIF (On Time In Full) tracking — the sales-committed delivery date.
    promisedDeliveryDate: z.string().optional(),
    // The marketplace platform's own order number (Meesho/Flipkart/Amazon) —
    // shown only for a marketplace order; used to match a settlement payout
    // back to this order later.
    channelOrderNumber: z.string().optional(),
    items: z.array(salesOrderItemSchema).min(1, 'Add at least one item'),
    // Only present/used in edit mode (see SalesOrderFormModal's status
    // dropdown) — zod strips unlisted keys by default, so without this field
    // here the chosen status would silently never reach the submit handler.
    status: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.customerMode === 'existing') {
      if (!values.customerId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerId'], message: 'Customer is required' });
      }
      return;
    }

    if (!values.newCustomerName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newCustomerName'],
        message: values.newCustomerType === 'marketplace' ? 'Buyer name is required' : 'Name is required',
      });
    }

    if (values.newCustomerType === 'direct') {
      // B2C is identified by phone, B2B by GSTIN — each is the field that
      // actually stays stable and unique for that kind of buyer.
      if (B2B_CUSTOMER_TYPES.includes(values.newCustomerDirectType)) {
        if (!values.newCustomerGstin?.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newCustomerGstin'], message: 'GSTIN is required for a business customer' });
        }
      } else if (!values.newCustomerPhone || values.newCustomerPhone.trim().length < 10) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newCustomerPhone'], message: 'Enter a valid phone number' });
      }
    } else if (!values.newCustomerChannelId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newCustomerChannelId'], message: 'Marketplace channel is required' });
    }

    // Delivery address applies to both Direct and Marketplace — see
    // newCustomerAddress's comment above.
    if (!values.newCustomerAddress?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newCustomerAddress'], message: 'Delivery address is required' });
    }
    if (!values.newCustomerCity?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newCustomerCity'], message: 'City is required' });
    }
    if (!values.newCustomerState?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newCustomerState'], message: 'State is required' });
    }
    if (!values.newCustomerPostalCode?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newCustomerPostalCode'], message: 'Postal code is required' });
    }
  });
