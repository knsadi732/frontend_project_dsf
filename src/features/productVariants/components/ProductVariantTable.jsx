import { Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';

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
    {
      key: 'attributes',
      header: 'Attributes',
      render: (row) => [row.material, row.gender, row.width, row.pattern].filter(Boolean).join(' · ') || '—',
    },
    { key: 'mrp', header: 'MRP', render: (row) => `₹${Number(row.mrp).toLocaleString('en-IN')}` },
    { key: 'sellingPrice', header: 'Selling Price', render: (row) => `₹${Number(row.sellingPrice).toLocaleString('en-IN')}` },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }} aria-label={`Edit ${row.sku}`}>
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
              aria-label={`Delete ${row.sku}`}
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
