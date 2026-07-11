import { Download, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function downloadProductPdf(row) {
  generateRecordPdf({
    title: `Product - ${row.name}`,
    fields: [
      { label: 'SKU', value: row.sku },
      { label: 'Category', value: row.category },
      { label: 'Price', value: `Rs.${Number(row.price).toLocaleString('en-IN')}` },
      { label: 'Stock', value: row.stock },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.sku}.pdf`,
  });
}

export function ProductTable({
  products,
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
    { key: 'name', header: 'Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      render: (row) => `₹${Number(row.price).toLocaleString('en-IN')}`,
    },
    { key: 'stock', header: 'Stock' },
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
      render: (row) => (
        <div className="flex justify-end gap-1">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              downloadProductPdf(row);
            }}
            aria-label={`Download ${row.name}`}
          >
            <Download className="size-4" />
          </AppButton>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${row.name}`}
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
      data={products}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No products yet"
    />
  );
}
