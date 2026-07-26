import { Ban, Check, Download, Pencil, PackageCheck, PackageOpen, Send, SendHorizonal } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { generatePurchaseOrderPdf } from '@/features/purchases/utils/generatePurchaseOrderPdf';
import { purchaseApi } from '@/features/purchases/api';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useCompanyQuery } from '@/features/company/queries/useCompanyQuery';

function variantLabel(variantId, variantsById, productsById) {
  const variant = variantsById?.[variantId];
  if (!variant) return variantId;
  return `${variant.sku} — ${productsById?.[variant.productId]?.name ?? 'Unknown product'}`;
}

function downloadPurchasePdf(row, productsById, variantsById, company, vendorsById, warehousesById) {
  // The list endpoint (which feeds this table) never returns `items` — only
  // GET /purchase-orders/:id joins them (same gap fixed for Convert-to-PO)
  // — fetch the full record so the PDF's item table isn't empty.
  purchaseApi.get(row.id).then((full) => {
    generatePurchaseOrderPdf({
      po: full,
      company,
      vendor: vendorsById[full.vendorId],
      warehouse: warehousesById[full.warehouseId],
      items: (full.items ?? []).map((item) => {
        const variant = variantsById[item.productVariantId];
        const product = productsById[variant?.productId];
        return {
          label: variantLabel(item.productVariantId, variantsById, productsById),
          quantity: item.quantity,
          unitCost: item.unitCost,
          hsnCode: product?.hsnCode,
          uom: product?.uom,
        };
      }),
    });
  });
}

const EDIT_LOCKED_STATUSES = ['completed', 'cancelled'];

// Real pipeline (purchase.schema.js / backend PURCHASE_ORDER_STATUS_PIPELINE):
// draft -> pending_approval -> approved -> sent -> acknowledged ->
// partially_received -> completed, one step at a time. Each entry here is
// the single next-step button shown for that status.
const NEXT_STEP = {
  draft: { status: 'pending_approval', label: 'Send for approval', icon: Send, variant: 'primary' },
  pending_approval: { status: 'approved', label: 'Approve PO', icon: Check, variant: 'success' },
  approved: { status: 'sent', label: 'Send to vendor', icon: SendHorizonal, variant: 'info' },
  sent: { status: 'acknowledged', label: 'Mark acknowledged', icon: PackageOpen, variant: 'info' },
  acknowledged: { status: 'partially_received', label: 'Mark partially received', icon: PackageCheck, variant: 'info' },
  partially_received: { status: 'completed', label: 'Mark completed', icon: PackageCheck, variant: 'success' },
};

export function PurchaseTable({
  purchases,
  productsById,
  variantsById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onTransitionStatus,
  onCancelOrder,
}) {
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const vendorsById = Object.fromEntries((vendorsData?.data ?? []).map((vendor) => [vendor.id, vendor]));

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehousesById = Object.fromEntries((warehousesData?.data ?? []).map((warehouse) => [warehouse.id, warehouse]));

  const { data: company } = useCompanyQuery();

  const columns = [
    { key: 'poNumber', header: 'PO Number' },
    { key: 'orderDate', header: 'Order Date' },
    {
      key: 'total',
      header: 'Total',
      render: (row) => `₹${Number(row.total).toLocaleString('en-IN')}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        const next = NEXT_STEP[row.status];
        const isCancellable = !EDIT_LOCKED_STATUSES.includes(row.status);
        return (
          <div className="flex justify-end gap-1">
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                downloadPurchasePdf(row, productsById, variantsById, company, vendorsById, warehousesById);
              }}
              aria-label={`Download ${row.poNumber}`}
              title="Download PDF"
            >
              <Download className="size-4" />
            </AppButton>
            {!EDIT_LOCKED_STATUSES.includes(row.status) && (
              <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(row);
                  }}
                  aria-label={`Edit ${row.poNumber}`}
                  title="View / edit"
                >
                  <Pencil className="size-4" />
                </AppButton>
              </Can>
            )}
            {next && (
              <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
                <AppButton
                  variant={next.variant}
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onTransitionStatus(row, next.status);
                  }}
                  aria-label={next.label}
                  title={next.label}
                >
                  <next.icon className="size-4" />
                </AppButton>
              </Can>
            )}
            {isCancellable && (
              <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
                <AppButton
                  variant="danger"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCancelOrder(row);
                  }}
                  aria-label="Cancel PO"
                  title="Cancel order"
                >
                  <Ban className="size-4" />
                </AppButton>
              </Can>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={purchases}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No purchase orders yet"
    />
  );
}
