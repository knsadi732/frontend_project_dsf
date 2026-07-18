import { createCrudApi } from '@/services/api/createCrudApi';
import { recordVendorBillPayment } from '@/services/vendorBill.api';

export const MOCK_VENDOR_PAYMENTS = [];

function onVendorPaymentCreate(record) {
  recordVendorBillPayment(record.vendorBillId, record.amount);
  return record;
}

export const vendorPaymentApi = createCrudApi('vendorPayments', MOCK_VENDOR_PAYMENTS, {
  hooks: { afterCreate: onVendorPaymentCreate },
});
