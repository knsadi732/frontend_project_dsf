import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { notificationApi } from '@/services/notification.api';
import { products, inventory, salesOrders, invoices, returns, MONTHLY_FIXED_COST } from '@/services/api/mockDb';
import { MODULES } from '@/constants/roles';

// Documented assumption: we only have live July 2026 transactional data, so
// Jan-Jun is a seeded historical baseline and "last year" is a synthetic
// reference series — both exist purely so the trend/comparison charts have
// something to plot against, not real history.
const HISTORICAL_BASELINE = [
  { month: 'Jan', sales: 320000 },
  { month: 'Feb', sales: 410000 },
  { month: 'Mar', sales: 380000 },
  { month: 'Apr', sales: 460000 },
  { month: 'May', sales: 502000 },
  { month: 'Jun', sales: 470000 },
];
const LAST_YEAR_SAME_MONTH = { Jun: 430000, Jul: 410000 };

function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function currentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

function monthLabel(date = new Date()) {
  return date.toLocaleString('en-US', { month: 'short' });
}

function sumSalesForMonth(monthKey) {
  return salesOrders
    .filter((so) => so.orderDate?.startsWith(monthKey))
    .reduce((sum, so) => sum + Number(so.total), 0);
}

function buildStats() {
  const totalInventoryQty = inventory.reduce((sum, row) => sum + Number(row.quantity), 0);
  const totalInventoryValue = inventory.reduce((sum, row) => {
    const product = products.find((p) => p.id === row.productId);
    return sum + Number(row.quantity) * Number(product?.price ?? 0);
  }, 0);

  const soByStatus = salesOrders.reduce((acc, so) => {
    acc[so.status] = (acc[so.status] ?? 0) + 1;
    return acc;
  }, {});

  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const partialInvoices = invoices.filter((inv) => inv.status === 'partial');
  const pendingInvoices = invoices.filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue');

  const paidTotal = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const partialTotal = partialInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue ?? inv.amount), 0);
  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  const categoriesUsed = new Set(products.map((p) => p.categoryId).filter(Boolean)).size;

  return [
    { key: 'inventoryQty', module: MODULES.INVENTORY, label: 'Inventory Quantity', value: totalInventoryQty.toLocaleString('en-IN') },
    { key: 'inventoryValue', module: MODULES.INVENTORY, label: 'Inventory Value', value: `₹${totalInventoryValue.toLocaleString('en-IN')}` },
    {
      key: 'salesOrders',
      module: MODULES.SALES,
      label: 'Sales Orders',
      value: String(salesOrders.length),
      delta: `+${soByStatus.pending ?? 0} pending`,
    },
    {
      key: 'invoicesPaid',
      module: MODULES.FINANCE,
      label: 'Invoices — Paid',
      value: `₹${paidTotal.toLocaleString('en-IN')}`,
      delta: `+${paidInvoices.length} invoices`,
    },
    {
      key: 'invoicesPartial',
      module: MODULES.FINANCE,
      label: 'Invoices — Part Payment',
      value: `₹${partialTotal.toLocaleString('en-IN')}`,
      delta: `+${partialInvoices.length} invoices`,
    },
    {
      key: 'invoicesPending',
      module: MODULES.FINANCE,
      label: 'Invoices — Pending',
      value: `₹${pendingTotal.toLocaleString('en-IN')}`,
      delta: `-${pendingInvoices.length} invoices`,
    },
    { key: 'totalSkus', module: MODULES.PRODUCTS, label: 'Total SKUs', value: String(products.length) },
    {
      key: 'categories',
      module: MODULES.PRODUCTS,
      label: 'Product Categories',
      value: String(categoriesUsed),
    },
  ];
}

function buildSalesTrend() {
  const liveMonthKey = currentMonthKey();
  const liveLabel = monthLabel();
  const liveTotal = sumSalesForMonth(liveMonthKey);
  return [...HISTORICAL_BASELINE, { month: liveLabel, sales: liveTotal }];
}

function buildForecast(trend) {
  const recent = trend.slice(-4);
  const growthRates = [];
  for (let i = 1; i < recent.length; i += 1) {
    const prev = recent[i - 1].sales;
    const curr = recent[i].sales;
    if (prev > 0) growthRates.push((curr - prev) / prev);
  }
  const avgGrowth = growthRates.length ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length : 0;
  const last = trend[trend.length - 1];
  const projected = Math.round(last.sales * (1 + avgGrowth));
  return {
    growthRate: Math.round(avgGrowth * 1000) / 10, // percent, 1 decimal
    data: [
      { month: last.month, sales: last.sales, projected: false },
      { month: 'Next mo. (proj)', sales: projected, projected: true },
    ],
  };
}

function buildBreakEven() {
  const activeProducts = products.filter((p) => p.status === 'active');
  const avgPrice = activeProducts.reduce((sum, p) => sum + p.price, 0) / (activeProducts.length || 1);
  const avgCost = activeProducts.reduce((sum, p) => sum + p.effectiveCost, 0) / (activeProducts.length || 1);
  const contributionMargin = avgPrice - avgCost;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(MONTHLY_FIXED_COST / contributionMargin) : null;

  const liveMonthKey = currentMonthKey();
  const currentMonthUnits = salesOrders
    .filter((so) => so.orderDate?.startsWith(liveMonthKey))
    .reduce((sum, so) => sum + so.items.reduce((s, item) => s + Number(item.quantity), 0), 0);

  return {
    fixedCost: MONTHLY_FIXED_COST,
    avgPrice: Math.round(avgPrice),
    avgCost: Math.round(avgCost),
    breakEvenUnits,
    currentMonthUnits,
    data: [
      { label: 'Break-even units', units: breakEvenUnits ?? 0 },
      { label: 'This month units sold', units: currentMonthUnits },
    ],
  };
}

function buildPeriodComparison() {
  const liveMonthKey = currentMonthKey();
  const liveLabel = monthLabel();
  const thisMonth = sumSalesForMonth(liveMonthKey);
  const lastMonthEntry = HISTORICAL_BASELINE[HISTORICAL_BASELINE.length - 1];
  const lastMonth = lastMonthEntry?.sales ?? 0;
  const lastYearSameMonth = LAST_YEAR_SAME_MONTH[liveLabel] ?? Math.round(lastMonth * 0.9);

  const pctVsLastMonth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 1000) / 10 : null;
  const pctVsLastYear =
    lastYearSameMonth > 0 ? Math.round(((thisMonth - lastYearSameMonth) / lastYearSameMonth) * 1000) / 10 : null;

  return {
    pctVsLastMonth,
    pctVsLastYear,
    data: [
      { label: `Last year ${liveLabel}`, sales: lastYearSameMonth },
      { label: 'Last month', sales: lastMonth },
      { label: `This month (${liveLabel})`, sales: thisMonth },
    ],
  };
}

function buildReturnRate() {
  const customer = returns.filter((r) => r.type === 'customer').length;
  const courier = returns.filter((r) => r.type === 'courier').length;
  const totalReturns = customer + courier;
  const customerPct = totalReturns ? Math.round((customer / totalReturns) * 100) : 0;
  const courierPct = totalReturns ? 100 - customerPct : 0;

  return {
    totalReturns,
    data: [
      { name: 'Customer return', value: customer, pct: customerPct },
      { name: 'Courier return', value: courier, pct: courierPct },
    ],
  };
}

function buildSummary(recentActivity) {
  const salesTrend = buildSalesTrend();
  return {
    stats: buildStats(),
    salesTrend,
    forecast: buildForecast(salesTrend),
    breakEven: buildBreakEven(),
    periodComparison: buildPeriodComparison(),
    returnRate: buildReturnRate(),
    recentActivity,
  };
}

export const dashboardApi = {
  summary: () => {
    if (env.mockAuth) {
      return notificationApi.list().then(({ data: notifications }) =>
        buildSummary(
          notifications.slice(0, 6).map((n) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            timestamp: formatRelativeTime(n.createdAt),
          })),
        ),
      );
    }
    return apiClient.get('/dashboard/summary').then((res) => res.data);
  },
};
