// Pure aggregation functions feeding the Ch18 report panels — each takes
// already-fetched arrays (no new mock endpoints) and returns plain rows for
// a ReportSection. Kept separate from components so the math is easy to
// read/verify independently of rendering.

// Real order items carry productVariantId (not productId) and no client-side
// `rate` — revenue per line comes from the server-computed lineTotal
// (order.service.js createOrder), falling back to quantity*unitPrice.
export function productWiseSales(salesOrders, variantsById, productsById) {
  const totals = new Map();
  salesOrders.forEach((so) => {
    (so.items ?? []).forEach((item) => {
      const variant = variantsById?.[item.productVariantId];
      const key = variant?.productId ?? item.productVariantId;
      const entry = totals.get(key) ?? { id: key, productId: key, quantity: 0, revenue: 0 };
      entry.quantity += Number(item.quantity);
      entry.revenue += Number(item.lineTotal ?? Number(item.quantity) * Number(item.unitPrice ?? 0));
      totals.set(key, entry);
    });
  });
  return Array.from(totals.values())
    .map((entry) => ({ ...entry, productName: productsById[entry.productId]?.name ?? entry.productId }))
    .sort((a, b) => b.revenue - a.revenue);
}

// Real orders carry customerId (not a customer name string) — resolve the
// display name via customersById.
export function customerSalesSummary(salesOrders, customersById) {
  const totals = new Map();
  salesOrders.forEach((so) => {
    const key = so.customerId;
    const entry = totals.get(key) ?? { id: key, customer: customersById?.[key]?.name ?? key, orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += Number(so.total ?? 0);
    totals.set(key, entry);
  });
  return Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue);
}

export function vendorWisePurchase(purchases) {
  const totals = new Map();
  purchases.forEach((po) => {
    const entry = totals.get(po.supplier) ?? { id: po.supplier, supplier: po.supplier, orders: 0, amount: 0 };
    entry.orders += 1;
    entry.amount += Number(po.total ?? 0);
    totals.set(po.supplier, entry);
  });
  return Array.from(totals.values()).sort((a, b) => b.amount - a.amount);
}

const AGING_BUCKETS = [
  { label: 'Current', max: 0 },
  { label: '1-30 days', max: 30 },
  { label: '31-60 days', max: 60 },
  { label: '60+ days', max: Infinity },
];

function agingBucket(dueDate) {
  const daysOverdue = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
  if (daysOverdue <= 0) return AGING_BUCKETS[0].label;
  const bucket = AGING_BUCKETS.find((b) => daysOverdue <= b.max);
  return bucket?.label ?? AGING_BUCKETS[AGING_BUCKETS.length - 1].label;
}

export function receivableAging(invoices) {
  return invoices
    .filter((inv) => Number(inv.balanceDue ?? 0) > 0)
    .map((inv) => ({
      id: inv.id,
      reference: inv.invoiceNumber,
      party: inv.party,
      dueDate: inv.dueDate,
      balanceDue: Number(inv.balanceDue ?? 0),
      bucket: agingBucket(inv.dueDate),
    }));
}

export function payableAging(vendorBills) {
  return vendorBills
    .filter((bill) => Number(bill.amountDue ?? 0) > 0)
    .map((bill) => ({
      id: bill.id,
      reference: bill.invoiceNumber,
      party: bill.vendorName ?? bill.vendorId,
      dueDate: bill.paymentDueDate,
      balanceDue: Number(bill.amountDue ?? 0),
      bucket: agingBucket(bill.paymentDueDate),
    }));
}

export function outstandingByKey(records, keyField, balanceField = 'balanceDue') {
  const totals = new Map();
  records.forEach((record) => {
    const key = record[keyField];
    const entry = totals.get(key) ?? { id: key, key, outstanding: 0, count: 0 };
    const balance = Number(record[balanceField] ?? 0);
    if (balance > 0) {
      entry.outstanding += balance;
      entry.count += 1;
    }
    totals.set(key, entry);
  });
  return Array.from(totals.values()).filter((entry) => entry.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding);
}

// Ch5.11 Customer Analytics: Total Orders, Total Revenue, AOV, Return Rate,
// Last Purchase Date, ranked by revenue for "Top Customers".
export function customerAnalytics(salesOrders, returns, customersById) {
  const totals = new Map();
  salesOrders.forEach((so) => {
    const key = so.customerId;
    const entry = totals.get(key) ?? { id: key, customer: customersById?.[key]?.name ?? key, totalOrders: 0, totalRevenue: 0, lastPurchaseDate: null };
    entry.totalOrders += 1;
    entry.totalRevenue += Number(so.total ?? 0);
    if (!entry.lastPurchaseDate || so.orderDate > entry.lastPurchaseDate) entry.lastPurchaseDate = so.orderDate;
    totals.set(key, entry);
  });

  // Returns are keyed by customer display name (its own `customer` field,
  // not a customerId), so match on the resolved name rather than the id.
  const returnCounts = new Map();
  returns.forEach((ret) => {
    returnCounts.set(ret.customer, (returnCounts.get(ret.customer) ?? 0) + 1);
  });

  return Array.from(totals.values())
    .map((entry) => {
      const returnCount = returnCounts.get(entry.customer) ?? 0;
      return {
        ...entry,
        avgOrderValue: entry.totalOrders ? Math.round(entry.totalRevenue / entry.totalOrders) : 0,
        returnRate: entry.totalOrders ? Math.round((returnCount / entry.totalOrders) * 100) : 0,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// Ch6.12 Vendor Performance: Order Fulfillment Rate / Rejection Rate derived
// from GRN accepted/rejected quantities (already recorded per GRN line item)
// joined back to the vendor via the GRN's linked Purchase Order.
export function vendorPerformance(grns, purchases, vendorsByName) {
  const purchasesById = new Map(purchases.map((po) => [po.id, po]));
  const totals = new Map();

  grns.forEach((grn) => {
    const po = purchasesById.get(grn.purchaseOrderId);
    const supplier = po?.supplier ?? 'Unknown vendor';
    const entry = totals.get(supplier) ?? { id: supplier, supplier, receivedQty: 0, acceptedQty: 0, rejectedQty: 0 };
    (grn.items ?? []).forEach((item) => {
      entry.receivedQty += Number(item.receivedQty ?? 0);
      entry.acceptedQty += Number(item.acceptedQty ?? 0);
      entry.rejectedQty += Number(item.rejectedQty ?? 0);
    });
    totals.set(supplier, entry);
  });

  return Array.from(totals.values())
    .map((entry) => ({
      ...entry,
      fulfillmentRate: entry.receivedQty ? Math.round((entry.acceptedQty / entry.receivedQty) * 100) : 0,
      rejectionRate: entry.receivedQty ? Math.round((entry.rejectedQty / entry.receivedQty) * 100) : 0,
      qualityRating: vendorsByName[entry.supplier]?.qualityRating ?? null,
    }))
    .sort((a, b) => b.fulfillmentRate - a.fulfillmentRate);
}

export function attendanceSummary(attendance, usersById) {
  const totals = new Map();
  attendance.forEach((record) => {
    const key = record.employeeId;
    const entry = totals.get(key) ?? { id: key, employeeId: key, present: 0, onLeave: 0, lateEntry: 0 };
    if (record.status === 'present') entry.present += 1;
    if (record.status === 'on_leave') entry.onLeave += 1;
    if (record.lateEntry) entry.lateEntry += 1;
    totals.set(key, entry);
  });
  return Array.from(totals.values()).map((entry) => ({
    ...entry,
    employeeName: usersById[entry.employeeId]?.firstName
      ? `${usersById[entry.employeeId].firstName} ${usersById[entry.employeeId].lastName ?? ''}`.trim()
      : entry.employeeId,
  }));
}
