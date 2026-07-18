import { createCrudApi } from '@/services/api/createCrudApi';
import { addNotification } from '@/services/notification.api';

export const MOCK_VENDOR_BILLS = [];

export function recordVendorBillPayment(vendorBillId, amount) {
  const bill = MOCK_VENDOR_BILLS.find((item) => item.id === vendorBillId);
  if (!bill) return;

  bill.paidAmount = Number(bill.paidAmount ?? 0) + Number(amount);
  bill.balanceDue = Math.max(0, Number(bill.amount) - bill.paidAmount);
  bill.status = bill.balanceDue <= 0 ? 'paid' : 'partial';

  addNotification({
    title: 'Vendor payment recorded',
    message: `₹${Number(amount).toLocaleString('en-IN')} paid against ${bill.billNumber} — ${bill.status}`,
    type: 'success',
  });
}

export const vendorBillApi = createCrudApi('vendorBills', MOCK_VENDOR_BILLS, { dateField: 'dueDate' });
