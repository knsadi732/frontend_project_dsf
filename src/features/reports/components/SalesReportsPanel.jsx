import { useMemo } from 'react';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';
import { productWiseSales, customerSalesSummary } from '@/features/reports/utils/reportAggregations';
import { AppInput } from '@/components/ui/AppInput';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';

export function SalesReportsPanel() {
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const { data: salesData } = useSalesOrdersQuery({ pageSize: 500, dateFrom: appliedDateFrom, dateTo: appliedDateTo });
  const { data: productsData } = useProductsQuery({ pageSize: 200 });

  const salesOrders = salesData?.data ?? [];
  const productsById = useMemo(
    () => Object.fromEntries((productsData?.data ?? []).map((p) => [p.id, p])),
    [productsData],
  );

  const productSales = useMemo(() => productWiseSales(salesOrders, productsById), [salesOrders, productsById]);
  const customerSales = useMemo(() => customerSalesSummary(salesOrders), [salesOrders]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <AppInput label="Order date from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        <AppInput label="Order date to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
      </div>

      <ReportSection
        title="Sales Register"
        description="Every sales order in the selected period."
        fileName="sales-register"
        columns={[
          { key: 'soNumber', header: 'SO #' },
          { key: 'customer', header: 'Customer' },
          { key: 'salesChannel', header: 'Channel' },
          { key: 'orderDate', header: 'Date' },
          { key: 'total', header: 'Amount', format: (row) => `₹${Number(row.total).toLocaleString('en-IN')}` },
          { key: 'status', header: 'Status' },
        ]}
        rows={salesOrders}
      />

      <ReportSection
        title="Product-wise Sales"
        description="Quantity and revenue sold per product."
        fileName="product-wise-sales"
        columns={[
          { key: 'productName', header: 'Product' },
          { key: 'quantity', header: 'Qty sold' },
          { key: 'revenue', header: 'Revenue', format: (row) => `₹${Number(row.revenue).toLocaleString('en-IN')}` },
        ]}
        rows={productSales}
      />

      <ReportSection
        title="Customer Sales Report"
        description="Order count and revenue per customer."
        fileName="customer-sales-report"
        columns={[
          { key: 'customer', header: 'Customer' },
          { key: 'orders', header: 'Orders' },
          { key: 'revenue', header: 'Revenue', format: (row) => `₹${Number(row.revenue).toLocaleString('en-IN')}` },
        ]}
        rows={customerSales}
      />
    </div>
  );
}
