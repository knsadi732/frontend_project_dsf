import { Download, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function downloadInventoryPdf(row) {
  generateRecordPdf({
    title: `Inventory - ${row.productName}`,
    fields: [
      { label: 'SKU', value: row.sku },
      { label: 'Warehouse', value: row.warehouse },
      { label: 'Quantity', value: row.quantity },
      { label: 'Reorder Level', value: row.reorderLevel },
      { label: 'Stock Status', value: row.quantity <= row.reorderLevel ? 'Low stock' : 'In stock' },
    ],
    fileName: `${row.sku}-inventory.pdf`,
  });
}

export function InventoryTable({
  items,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}) {
  const columns = [
    { key: 'sku', header: 'SKU' },
    { key: 'productName', header: 'Product Name' },
    { key: 'warehouse', header: 'Warehouse' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'reorderLevel', header: 'Reorder Level' },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) =>
        row.quantity <= row.reorderLevel ? (
          <BaseBadge variant="danger">Low stock</BaseBadge>
        ) : (
          <BaseBadge variant="success">In stock</BaseBadge>
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
              downloadInventoryPdf(row);
            }}
            aria-label={`Download ${row.productName}`}
          >
            <Download className="size-4" />
          </AppButton>
          <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              aria-label={`Edit ${row.productName}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.INVENTORY} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${row.productName}`}
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
      data={items}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No inventory items yet"
    />
  );
}
