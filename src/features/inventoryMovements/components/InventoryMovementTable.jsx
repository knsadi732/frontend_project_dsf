import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

// Real backend enum (plan.md Ch10.8): purchase_receipt/production_receipt/
// return_receipt add stock (success), dispatch/damage_entry remove it
// (warning), sales_reservation/stock_transfer/stock_adjustment/
// physical_stock_count are neutral (default).
const MOVEMENT_VARIANT = {
  purchase_receipt: 'success',
  production_receipt: 'success',
  return_receipt: 'success',
  dispatch: 'warning',
  damage_entry: 'warning',
};

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function InventoryMovementTable({ movements, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'createdAt', header: 'When', render: (row) => formatDateTime(row.createdAt) },
    { key: 'reference', header: 'Item' },
    { key: 'warehouse', header: 'Warehouse / Store' },
    {
      key: 'movementType',
      header: 'Movement',
      render: (row) => <BaseBadge variant={MOVEMENT_VARIANT[row.movementType] ?? 'default'}>{row.movementType?.replace(/_/g, ' ')}</BaseBadge>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => (
        <span className={row.quantityChange > 0 ? 'text-success' : row.quantityChange < 0 ? 'text-danger' : 'text-text-muted'}>
          {row.quantityChange > 0 ? '+' : ''}
          {row.quantityChange}
        </span>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={movements}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No inventory movements yet"
    />
  );
}
