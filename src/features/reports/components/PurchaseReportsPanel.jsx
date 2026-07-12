import { useMemo } from 'react';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';
import { vendorWisePurchase } from '@/features/reports/utils/reportAggregations';
import { AppInput } from '@/components/ui/AppInput';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';

export function PurchaseReportsPanel() {
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const { data } = usePurchasesQuery({ pageSize: 500, dateFrom: appliedDateFrom, dateTo: appliedDateTo });
  const purchases = data?.data ?? [];

  const vendorWise = useMemo(() => vendorWisePurchase(purchases), [purchases]);
  const pending = useMemo(() => purchases.filter((po) => po.status === 'draft' || po.status === 'pending'), [purchases]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <AppInput label="Order date from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        <AppInput label="Order date to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
      </div>

      <ReportSection
        title="Purchase Register"
        description="Every purchase order in the selected period."
        fileName="purchase-register"
        columns={[
          { key: 'poNumber', header: 'PO #' },
          { key: 'supplier', header: 'Vendor' },
          { key: 'orderDate', header: 'Date' },
          { key: 'total', header: 'Amount', format: (row) => `₹${Number(row.total).toLocaleString('en-IN')}` },
          { key: 'status', header: 'Status' },
        ]}
        rows={purchases}
      />

      <ReportSection
        title="Vendor-wise Purchase"
        description="Order count and amount per vendor."
        fileName="vendor-wise-purchase"
        columns={[
          { key: 'supplier', header: 'Vendor' },
          { key: 'orders', header: 'Orders' },
          { key: 'amount', header: 'Amount', format: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
        ]}
        rows={vendorWise}
      />

      <ReportSection
        title="Pending Purchase Orders"
        description="Draft or pending purchase orders awaiting approval."
        fileName="pending-purchase-orders"
        columns={[
          { key: 'poNumber', header: 'PO #' },
          { key: 'supplier', header: 'Vendor' },
          { key: 'orderDate', header: 'Date' },
          { key: 'total', header: 'Amount', format: (row) => `₹${Number(row.total).toLocaleString('en-IN')}` },
          { key: 'status', header: 'Status' },
        ]}
        rows={pending}
      />
    </div>
  );
}
