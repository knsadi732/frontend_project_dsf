import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

export function ProductVariantTable({
  variants,
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
  const columns = [
    { key: 'product', header: 'Product', render: (row) => productsById?.[row.productId]?.name ?? row.productId },
    { key: 'size', header: 'Size' },
    { key: 'color', header: 'Color' },
    { key: 'sku', header: 'SKU' },
    { key: 'barcode', header: 'Barcode' },
    { key: 'mrp', header: 'MRP', render: (row) => `₹${Number(row.mrp).toLocaleString('en-IN')}` },
    { key: 'sellingPrice', header: 'Selling Price', render: (row) => `₹${Number(row.sellingPrice).toLocaleString('en-IN')}` },
    { key: 'costPrice', header: 'Cost Price', render: (row) => `₹${Number(row.costPrice).toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.sku}`} onClick={(e) => { e.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.sku}`} onClick={(e) => { e.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={variants}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No product variants yet"
    />
  );
}
