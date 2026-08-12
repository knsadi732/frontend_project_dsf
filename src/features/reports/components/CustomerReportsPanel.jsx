import { useMemo } from 'react';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useReturnsQuery } from '@/features/returns/queries/useReturnsQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { outstandingByKey, customerAnalytics } from '@/features/reports/utils/reportAggregations';

export function CustomerReportsPanel() {
  const { data: customersData } = useCustomersQuery({ pageSize: 200 });
  const { data: invoicesData } = useInvoicesQuery({ pageSize: 500 });
  const { data: salesData } = useSalesOrdersQuery({ pageSize: 500 });
  const { data: returnsData } = useReturnsQuery({ pageSize: 500 });

  const customers = customersData?.data ?? [];
  const invoices = invoicesData?.data ?? [];
  const salesOrders = salesData?.data ?? [];
  const returns = returnsData?.data ?? [];

  const customersById = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c])),
    [customers],
  );

  const outstanding = useMemo(() => outstandingByKey(invoices, 'party'), [invoices]);
  const analytics = useMemo(() => customerAnalytics(salesOrders, returns, customersById), [salesOrders, returns, customersById]);

  const topCustomer = analytics[0];
  const avgAov = analytics.length
    ? Math.round(analytics.reduce((sum, row) => sum + row.avgOrderValue, 0) / analytics.length)
    : 0;
  const avgReturnRate = analytics.length
    ? Math.round(analytics.reduce((sum, row) => sum + row.returnRate, 0) / analytics.length)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active customers" value={customers.length} />
        <StatCard label="Avg order value" value={`₹${avgAov.toLocaleString('en-IN')}`} />
        <StatCard label="Avg return rate" value={`${avgReturnRate}%`} />
        <StatCard label="Top customer" value={topCustomer?.customer ?? '—'} />
      </div>

      <ReportSection
        title="Customer Register"
        description="Every customer and their credit terms."
        fileName="customer-register"
        columns={[
          { key: 'name', header: 'Customer' },
          { key: 'customerType', header: 'Type' },
          { key: 'phone', header: 'Phone' },
          { key: 'creditLimit', header: 'Credit Limit', format: (row) => `₹${Number(row.creditLimit ?? 0).toLocaleString('en-IN')}` },
          { key: 'creditDays', header: 'Credit Days' },
          { key: 'status', header: 'Status' },
        ]}
        rows={customers}
      />

      <ReportSection
        title="Customer Analytics (Top Customers)"
        description="Total orders, revenue, average order value, return rate and last purchase date, ranked by revenue."
        fileName="customer-analytics"
        columns={[
          { key: 'customer', header: 'Customer' },
          { key: 'totalOrders', header: 'Total Orders' },
          { key: 'totalRevenue', header: 'Total Revenue', format: (row) => `₹${Number(row.totalRevenue).toLocaleString('en-IN')}` },
          { key: 'avgOrderValue', header: 'Avg Order Value', format: (row) => `₹${Number(row.avgOrderValue).toLocaleString('en-IN')}` },
          { key: 'returnRate', header: 'Return Rate', format: (row) => `${row.returnRate}%` },
          { key: 'lastPurchaseDate', header: 'Last Purchase' },
        ]}
        rows={analytics}
      />

      <ReportSection
        title="Customer Outstanding"
        description="Unpaid/partial invoice balance per customer."
        fileName="customer-outstanding"
        columns={[
          { key: 'key', header: 'Customer' },
          { key: 'count', header: 'Open invoices' },
          { key: 'outstanding', header: 'Outstanding', format: (row) => `₹${Number(row.outstanding).toLocaleString('en-IN')}` },
        ]}
        rows={outstanding}
      />
    </div>
  );
}
