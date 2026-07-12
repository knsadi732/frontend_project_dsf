import { useMemo } from 'react';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useVendorBillsQuery } from '@/features/vendorBills/queries/useVendorBillsQuery';
import { usePaymentsQuery } from '@/features/payments/queries/usePaymentsQuery';
import { useVendorPaymentsQuery } from '@/features/vendorBills/queries/useVendorPaymentsQuery';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';
import { receivableAging, payableAging } from '@/features/reports/utils/reportAggregations';

export function FinanceReportsPanel() {
  const { data: invoicesData } = useInvoicesQuery({ pageSize: 500 });
  const { data: vendorBillsData } = useVendorBillsQuery({ pageSize: 500 });
  const { data: paymentsData } = usePaymentsQuery({ pageSize: 500 });
  const { data: vendorPaymentsData } = useVendorPaymentsQuery({ pageSize: 500 });
  const { data: vendorsData } = useVendorsQuery({ pageSize: 200 });

  const invoices = invoicesData?.data ?? [];
  const vendorBills = vendorBillsData?.data ?? [];
  const payments = paymentsData?.data ?? [];
  const vendorPayments = vendorPaymentsData?.data ?? [];
  const vendorsById = useMemo(() => Object.fromEntries((vendorsData?.data ?? []).map((v) => [v.id, v])), [vendorsData]);

  const arAging = useMemo(() => receivableAging(invoices), [invoices]);
  const apAging = useMemo(() => payableAging(vendorBills, vendorsById), [vendorBills, vendorsById]);

  const paymentRegister = useMemo(
    () => [
      ...payments.map((p) => ({ ...p, id: `receipt-${p.id}`, direction: 'Receipt', reference: invoices.find((inv) => inv.id === p.invoiceId)?.invoiceNumber ?? p.invoiceId, date: p.paidDate })),
      ...vendorPayments.map((p) => ({ ...p, id: `payment-${p.id}`, direction: 'Payment', reference: vendorBills.find((bill) => bill.id === p.vendorBillId)?.billNumber ?? p.vendorBillId, date: p.paidDate })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [payments, vendorPayments, invoices, vendorBills],
  );

  return (
    <div className="flex flex-col gap-4">
      <ReportSection
        title="Accounts Receivable Aging"
        description="Outstanding customer invoice balances by age bucket."
        fileName="ar-aging"
        columns={[
          { key: 'reference', header: 'Invoice #' },
          { key: 'party', header: 'Customer' },
          { key: 'dueDate', header: 'Due Date' },
          { key: 'balanceDue', header: 'Balance Due', format: (row) => `₹${Number(row.balanceDue).toLocaleString('en-IN')}` },
          { key: 'bucket', header: 'Aging Bucket' },
        ]}
        rows={arAging}
      />

      <ReportSection
        title="Accounts Payable Aging"
        description="Outstanding vendor bill balances by age bucket."
        fileName="ap-aging"
        columns={[
          { key: 'reference', header: 'Bill #' },
          { key: 'party', header: 'Vendor' },
          { key: 'dueDate', header: 'Due Date' },
          { key: 'balanceDue', header: 'Balance Due', format: (row) => `₹${Number(row.balanceDue).toLocaleString('en-IN')}` },
          { key: 'bucket', header: 'Aging Bucket' },
        ]}
        rows={apAging}
      />

      <ReportSection
        title="Payment Register"
        description="Every customer receipt and vendor payment."
        fileName="payment-register"
        columns={[
          { key: 'date', header: 'Date' },
          { key: 'direction', header: 'Type' },
          { key: 'reference', header: 'Reference' },
          { key: 'amount', header: 'Amount', format: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
          { key: 'method', header: 'Method' },
        ]}
        rows={paymentRegister}
      />
    </div>
  );
}
