import { Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

export function InventoryTable({ items, isLoading, page, pageSize, total, onPageChange, onEdit, onDelete }) {
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
          <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={() => onEdit(row)} aria-label={`Edit ${row.productName}`}>
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.INVENTORY} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
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
      emptyMessage="No inventory items yet"
    />
  );
}
