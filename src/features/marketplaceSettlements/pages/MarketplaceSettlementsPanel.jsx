import { useState } from 'react';
import { useMarketplaceSettlementsQuery } from '@/features/marketplaceSettlements/queries/useMarketplaceSettlementsQuery';
import { useMonthlyChannelCostQuery } from '@/features/marketplaceSettlements/queries/useMonthlyChannelCostQuery';
import { useMonthlyProductCostQuery } from '@/features/marketplaceSettlements/queries/useMonthlyProductCostQuery';
import { useCreateMarketplaceSettlement } from '@/features/marketplaceSettlements/mutations/useCreateMarketplaceSettlement';
import { MarketplaceSettlementFormModal } from '@/features/marketplaceSettlements/components/MarketplaceSettlementFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const RETURN_TYPE_LABEL = { none: 'Kept', customer: 'CR', courier: 'RTO' };

export function MarketplaceSettlementsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useMarketplaceSettlementsQuery({ page, pageSize });
  const { data: monthlyCost = [] } = useMonthlyChannelCostQuery();
  const { data: monthlyProductCost = [] } = useMonthlyProductCostQuery();
  const createSettlement = useCreateMarketplaceSettlement();

  const handleSubmit = (values) => {
    createSettlement.mutateAsync(values).then(() => setFormOpen(false));
  };

  const columns = [
    { key: 'settlementNumber', header: 'Settlement #' },
    { key: 'channelName', header: 'Channel' },
    { key: 'invoiceNumber', header: 'Invoice #', render: (row) => row.invoiceNumber || '—' },
    { key: 'orderNumber', header: 'Order #', render: (row) => row.orderNumber || '—' },
    { key: 'returnType', header: 'Type', render: (row) => <BaseBadge variant={row.returnType === 'none' ? 'default' : 'warning'}>{RETURN_TYPE_LABEL[row.returnType]}</BaseBadge> },
    { key: 'grossSaleAmount', header: 'Gross (₹)', render: (row) => `₹${row.grossSaleAmount.toLocaleString('en-IN')}` },
    {
      key: 'totalCost',
      header: 'Marketplace Cost (₹)',
      render: (row) => `₹${(row.commissionAmount + row.shippingCharge + row.returnCharge + row.adsCharge).toLocaleString('en-IN')}`,
    },
    { key: 'tcsAmount', header: 'TCS (₹)', render: (row) => `₹${row.tcsAmount.toLocaleString('en-IN')}` },
    { key: 'tdsAmount', header: 'TDS (₹)', render: (row) => `₹${row.tdsAmount.toLocaleString('en-IN')}` },
    { key: 'netAmountReceived', header: 'Net Received (₹)', render: (row) => `₹${row.netAmountReceived.toLocaleString('en-IN')}` },
    { key: 'settlementDate', header: 'Date' },
  ];

  const monthlyCostColumns = [
    { key: 'channelName', header: 'Channel' },
    { key: 'totalOrders', header: 'Orders this month' },
    { key: 'customerReturnPercent', header: 'Actual CR%', render: (row) => `${row.customerReturnPercent}%` },
    { key: 'rtoPercent', header: 'Actual RTO%', render: (row) => `${row.rtoPercent}%` },
    { key: 'actualCostPerUnit', header: 'Actual Cost/Pair (₹)', render: (row) => `₹${row.actualCostPerUnit.toFixed(2)}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Payment Advice / settlement records from each marketplace — real per-order deductions (commission, courier,
          return, ads, TCS, TDS). Once enough of these accumulate, "Actual Cost/Pair" below replaces the channel's
          default cost assumption in the Pricing Calculator.
        </p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>New settlement</CreateButton>
        </Can>
      </div>

      {monthlyCost.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-text">This month's actual marketplace cost — real data vs assumption</p>
          <AppTable columns={monthlyCostColumns} data={monthlyCost} emptyMessage="No settlements this month yet" />
        </div>
      )}

      {monthlyProductCost.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-text">Actual marketplace cost by product — not one blanket number for the whole business</p>
          <AppTable
            columns={[
              { key: 'productName', header: 'Product' },
              { key: 'categoryName', header: 'Category', render: (row) => row.categoryName || '—' },
              { key: 'variantSku', header: 'SKU' },
              { key: 'totalOrders', header: 'Orders' },
              { key: 'customerReturnPercent', header: 'Actual CR%', render: (row) => `${row.customerReturnPercent}%` },
              { key: 'rtoPercent', header: 'Actual RTO%', render: (row) => `${row.rtoPercent}%` },
              { key: 'actualCostPerUnit', header: 'Actual Cost/Pair (₹)', render: (row) => `₹${row.actualCostPerUnit.toFixed(2)}` },
            ]}
            data={monthlyProductCost}
            emptyMessage="No product-tagged settlements this month yet"
          />
        </div>
      )}

      <AppTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage="No settlements recorded yet"
      />

      <MarketplaceSettlementFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createSettlement.isPending}
      />
    </div>
  );
}
