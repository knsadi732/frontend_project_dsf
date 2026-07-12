import { useMemo } from 'react';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { useVendorBillsQuery } from '@/features/vendorBills/queries/useVendorBillsQuery';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useGoodsReceiptNotesQuery } from '@/features/goodsReceiptNotes/queries/useGoodsReceiptNotesQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { outstandingByKey, vendorPerformance } from '@/features/reports/utils/reportAggregations';

export function VendorReportsPanel() {
  const { data: vendorsData } = useVendorsQuery({ pageSize: 200 });
  const { data: vendorBillsData } = useVendorBillsQuery({ pageSize: 500 });
  const { data: purchasesData } = usePurchasesQuery({ pageSize: 500 });
  const { data: grnsData } = useGoodsReceiptNotesQuery({ pageSize: 500 });

  const vendors = vendorsData?.data ?? [];
  const vendorBills = vendorBillsData?.data ?? [];
  const purchases = purchasesData?.data ?? [];
  const grns = grnsData?.data ?? [];
  const vendorsById = useMemo(() => Object.fromEntries(vendors.map((v) => [v.id, v])), [vendors]);
  const vendorsByName = useMemo(() => Object.fromEntries(vendors.map((v) => [v.name, v])), [vendors]);

  const outstanding = useMemo(
    () => outstandingByKey(vendorBills, 'vendorId').map((entry) => ({ ...entry, vendorName: vendorsById[entry.key]?.name ?? entry.key })),
    [vendorBills, vendorsById],
  );
  const performance = useMemo(() => vendorPerformance(grns, purchases, vendorsByName), [grns, purchases, vendorsByName]);

  const activeVendors = vendors.filter((v) => v.status === 'active').length;
  const monthlyPurchaseValue = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return purchases.filter((po) => po.orderDate?.startsWith(currentMonth)).reduce((sum, po) => sum + Number(po.total ?? 0), 0);
  }, [purchases]);
  const pendingPOs = purchases.filter((po) => po.status === 'draft' || po.status === 'pending').length;
  const totalOutstanding = outstanding.reduce((sum, entry) => sum + entry.outstanding, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total vendors" value={vendors.length} />
        <StatCard label="Active vendors" value={activeVendors} />
        <StatCard label="Monthly purchase value" value={`₹${monthlyPurchaseValue.toLocaleString('en-IN')}`} />
        <StatCard label="Pending POs" value={pendingPOs} />
        <StatCard label="Outstanding payments" value={`₹${totalOutstanding.toLocaleString('en-IN')}`} />
      </div>

      <ReportSection
        title="Vendor Register"
        description="Every vendor and their payment terms."
        fileName="vendor-register"
        columns={[
          { key: 'name', header: 'Vendor' },
          { key: 'vendorType', header: 'Type' },
          { key: 'phone', header: 'Phone' },
          { key: 'paymentTerms', header: 'Payment Terms' },
          { key: 'creditLimit', header: 'Credit Limit', format: (row) => `₹${Number(row.creditLimit ?? 0).toLocaleString('en-IN')}` },
          { key: 'qualityRating', header: 'Quality Rating', format: (row) => (row.qualityRating ? '★'.repeat(row.qualityRating) : '—') },
          { key: 'status', header: 'Status' },
        ]}
        rows={vendors}
      />

      <ReportSection
        title="Vendor Performance Ranking"
        description="Order fulfillment rate and rejection rate derived from GRN quantities, ranked by fulfillment rate."
        fileName="vendor-performance"
        columns={[
          { key: 'supplier', header: 'Vendor' },
          { key: 'receivedQty', header: 'Received Qty' },
          { key: 'fulfillmentRate', header: 'Fulfillment Rate', format: (row) => `${row.fulfillmentRate}%` },
          { key: 'rejectionRate', header: 'Rejection Rate', format: (row) => `${row.rejectionRate}%` },
          { key: 'qualityRating', header: 'Quality Rating', format: (row) => (row.qualityRating ? '★'.repeat(row.qualityRating) : '—') },
        ]}
        rows={performance}
      />

      <ReportSection
        title="Vendor Outstanding"
        description="Unpaid/partial vendor bill balance per vendor."
        fileName="vendor-outstanding"
        columns={[
          { key: 'vendorName', header: 'Vendor' },
          { key: 'count', header: 'Open bills' },
          { key: 'outstanding', header: 'Outstanding', format: (row) => `₹${Number(row.outstanding).toLocaleString('en-IN')}` },
        ]}
        rows={outstanding}
      />
    </div>
  );
}
