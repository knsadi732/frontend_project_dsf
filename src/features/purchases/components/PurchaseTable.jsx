import { Download, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function downloadPurchasePdf(row, productsById) {
  generateRecordPdf({
    title: `Purchase Order - ${row.poNumber}`,
    fields: [
      { label: 'Supplier', value: row.supplier },
      { label: 'Order Date', value: row.orderDate },
      { label: 'Status', value: row.status },
    ],
    items: row.items,
    itemsColumns: [
      { key: 'productId', label: 'Product', width: 80, format: (v) => productsById?.[v]?.name ?? v },
      { key: 'quantity', label: 'Qty', width: 25 },
      { key: 'rate', label: 'Rate', width: 30, format: (v) => `Rs.${Number(v).toLocaleString('en-IN')}` },
      {
        key: 'amount',
        label: 'Amount',
        width: 35,
        format: (_v, item) => `Rs.${(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}`,
      },
    ],
    total: `Total: Rs.${Number(row.total).toLocaleString('en-IN')}`,
    fileName: `${row.poNumber}.pdf`,
  });
}

const EDIT_LOCKED_STATUSES = ['approved', 'completed'];

export function PurchaseTable({
  purchases,
  productsById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}) {
  const handleRowClick = (row) => {
    if (!EDIT_LOCKED_STATUSES.includes(row.status)) onEdit(row);
  };

  const columns = [
    { key: 'poNumber', header: 'PO Number' },
    { key: 'supplier', header: 'Supplier' },
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
      key: 'priority',
      header: 'Priority',
      render: (row) =>
        row.priority === 'urgent' ? (
          <BaseBadge variant="danger">Urgent</BaseBadge>
        ) : (
          <span className="text-xs text-text-muted">Normal</span>
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
              downloadPurchasePdf(row, productsById);
            }}
            aria-label={`Download ${row.poNumber}`}
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
              >
                <Pencil className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.PURCHASES} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${row.poNumber}`}
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
      data={purchases}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={handleRowClick}
      emptyMessage="No purchase orders yet"
    />
  );
}
