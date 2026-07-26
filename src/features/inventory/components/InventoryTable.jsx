import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { DownloadButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function totalQuantity(row) {
  return (
    Number(row.quantity || 0) +
    Number(row.reservedQuantity || 0) +
    Number(row.damagedQuantity || 0) +
    Number(row.inTransitQuantity || 0) +
    Number(row.repairQuantity || 0)
  );
}

function downloadInventoryPdf(row) {
  generateRecordPdf({
    title: `Inventory - ${row.productName}`,
    fields: [
      { label: 'SKU', value: row.sku },
      { label: 'Warehouse', value: row.warehouse },
      { label: 'Available Quantity', value: row.quantity },
      { label: 'Reserved', value: row.reservedQuantity ?? 0 },
      { label: 'Damaged', value: row.damagedQuantity ?? 0 },
      { label: 'In Transit', value: row.inTransitQuantity ?? 0 },
      { label: 'In Repair', value: row.repairQuantity ?? 0 },
      { label: 'Total Quantity', value: totalQuantity(row) },
      { label: 'Reorder Level', value: row.reorderLevel },
      { label: 'Stock Status', value: row.quantity <= row.reorderLevel ? 'Low stock' : 'In stock' },
    ],
    fileName: `${row.sku}-inventory.pdf`,
  });
}

export function InventoryTable({
  items,
  binsById,
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
    { key: 'bin', header: 'Bin', render: (row) => binsById?.[row.binLocationId]?.code ?? '—' },
    { key: 'quantity', header: 'Available' },
    { key: 'reservedQuantity', header: 'Reserved', render: (row) => row.reservedQuantity ?? 0 },
    { key: 'repairQuantity', header: 'In Repair', render: (row) => row.repairQuantity ?? 0 },
    { key: 'total', header: 'Total', render: (row) => totalQuantity(row) },
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
          <DownloadButton label={`Download ${row.productName}`} onClick={(event) => { event.stopPropagation(); downloadInventoryPdf(row); }} />
          <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.productName}`} onClick={(event) => { event.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.INVENTORY} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.productName}`} onClick={(event) => { event.stopPropagation(); onDelete(row); }} />
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
