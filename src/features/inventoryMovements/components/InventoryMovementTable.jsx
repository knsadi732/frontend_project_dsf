import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';

const MOVEMENT_VARIANT = {
  stock_in: 'success',
  material_in: 'success',
  stock_out: 'warning',
  material_out: 'warning',
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
    { key: 'quantity', header: 'Quantity' },
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
