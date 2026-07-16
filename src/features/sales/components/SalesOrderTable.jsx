import { CheckCircle2, ClipboardList, Download, Package, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { generateRecordPdf } from '@/utils/generateRecordPdf';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useInventoryListQuery } from '@/features/inventory/queries/useInventoryListQuery';

function downloadSalesOrderPdf(row) {
  generateRecordPdf({
    title: `Sales Order - ${row.soNumber}`,
    fields: [
      { label: 'Customer', value: row.customer },
      { label: 'Order Date', value: row.orderDate },
      { label: 'Total', value: `Rs.${Number(row.total).toLocaleString('en-IN')}` },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.soNumber}.pdf`,
  });
}

// Ch14.14 Picking: Pick List — SKU/Qty/Warehouse/Bin per line item.
function downloadPickList(row, productsById, inventoryByProductId) {
  generateRecordPdf({
    title: `Pick List - ${row.soNumber}`,
    fields: [
      { label: 'Customer', value: row.customer },
      { label: 'Generated', value: row.pickListGeneratedAt ? new Date(row.pickListGeneratedAt).toLocaleString() : '-' },
    ],
    items: row.items,
    itemsColumns: [
      { key: 'productId', label: 'SKU', width: 40, format: (id) => productsById[id]?.sku ?? id },
      { key: 'productId', label: 'Product', width: 60, format: (id) => productsById[id]?.name ?? id },
      { key: 'quantity', label: 'Qty', width: 20 },
      { key: 'productId', label: 'Warehouse', width: 40, format: (id) => inventoryByProductId[id]?.warehouse ?? '-' },
      { key: 'productId', label: 'Bin', width: 20, format: (id) => inventoryByProductId[id]?.binLocationId ?? '-' },
    ],
    fileName: `${row.soNumber}-pick-list.pdf`,
  });
}

// Ch14.15-16 Packing / Dispatch Preparation: Packing Slip + Dispatch Note.
function downloadPackingSlip(row) {
  generateRecordPdf({
    title: `Packing Slip / Dispatch Note - ${row.soNumber}`,
    fields: [
      { label: 'Customer', value: row.customer },
      { label: 'Dispatch Note #', value: row.dispatchNoteNumber },
      { label: 'Packed At', value: row.packedAt ? new Date(row.packedAt).toLocaleString() : '-' },
      { label: 'Dispatch Date', value: row.dispatchDate },
    ],
    items: row.items,
    itemsColumns: [
      { key: 'quantity', label: 'Qty', width: 30 },
      { key: 'rate', label: 'Rate', width: 40, format: (v) => `Rs.${Number(v).toLocaleString('en-IN')}` },
    ],
    fileName: `${row.soNumber}-packing-slip.pdf`,
  });
}

export function SalesOrderTable({
  salesOrders,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onMarkDelivered,
}) {
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((p) => [p.id, p]));

  const { data: inventoryData } = useInventoryListQuery({ pageSize: 500 });
  const inventoryByProductId = Object.fromEntries((inventoryData?.data ?? []).map((row) => [row.productId, row]));

  const columns = [
    { key: 'soNumber', header: 'SO Number' },
    { key: 'customer', header: 'Customer' },
    { key: 'salesChannel', header: 'Channel', render: (row) => <span className="capitalize">{row.salesChannel ?? 'manual'}</span> },
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
      key: 'eta',
      header: 'Dispatch / ETA',
      render: (row) =>
        row.dispatchDate ? `Dispatch ${row.dispatchDate}` : row.productionEta ? `ETA ${row.productionEta}` : '—',
    },
    {
      key: 'linked',
      header: 'Linked',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.linkedWorkOrders?.map((wo) => (
            <BaseBadge key={wo} variant="info">
              {wo}
            </BaseBadge>
          ))}
          {row.invoiceNumber && <BaseBadge variant="success">{row.invoiceNumber}</BaseBadge>}
          {!row.linkedWorkOrders?.length && !row.invoiceNumber && (
            <span className="text-xs text-text-muted">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              downloadSalesOrderPdf(row);
            }}
            aria-label={`Download ${row.soNumber}`}
          >
            <Download className="size-4" />
          </AppButton>
          {row.pickListGeneratedAt && (
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                downloadPickList(row, productsById, inventoryByProductId);
              }}
              aria-label={`Download pick list for ${row.soNumber}`}
            >
              <ClipboardList className="size-4" />
            </AppButton>
          )}
          {row.packedAt && (
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                downloadPackingSlip(row);
              }}
              aria-label={`Download packing slip for ${row.soNumber}`}
            >
              <Package className="size-4" />
            </AppButton>
          )}
          {row.dispatchNoteGeneratedAt && !row.deliveredAt && (
            <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkDelivered(row);
                }}
                aria-label={`Mark ${row.soNumber} as delivered`}
                className="text-success hover:bg-success/10"
              >
                <CheckCircle2 className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              aria-label={`Edit ${row.soNumber}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.SALES} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${row.soNumber}`}
              className="text-danger hover:bg-danger/10"
            >
              <Trash2 className="size-4" />
            </AppButton>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={salesOrders}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No sales orders yet"
    />
  );
}
